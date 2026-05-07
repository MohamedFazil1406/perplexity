import express from "express";
import { tavily } from "@tavily/core";
import { OpenRouter } from "@openrouter/sdk";
import cors from "cors";
import crypto from "crypto";

import { SYSTEM_PROMPT, PROMPT_TEMPLATE } from "./prompt";
import { prisma } from "./db";
import { middleware } from "./middleware";

const app = express();

app.use(express.json());
app.use(cors());

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

function slugify(text: string) {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "chat";

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function sourcesBlock(results: { url: string }[]) {
  return `\n<SOURCES>\n${JSON.stringify(
    results.map((r) => ({ url: r.url })),
  )}\n</SOURCES>\n`;
}

const openRouterClient = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

app.get("/conversations", middleware, async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      userId: req.userId!,
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({ conversations });
});

app.get("/conversation/:conversationId", middleware, async (req, res) => {
  const conversationId = req.params.conversationId;

  if (typeof conversationId !== "string") {
    res.status(400).json({
      message: "Invalid conversation id",
    });
    return;
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId: req.userId!,
    },
    include: {
      message: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!conversation) {
    res.status(404).json({
      message: "Conversation not found",
    });
    return;
  }

  res.json({ conversation });
});

app.post("/perplexity-ask", middleware, async (req, res) => {
  try {
    const query = req.body.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({
        message: "Query is required",
      });
      return;
    }

    // Step 1 — Web Search
    const webSearchResponse = await tavilyClient.search(query, {
      searchDepth: "advanced",
    });

    const webSearchResult = webSearchResponse.results;

    // Step 2 — Create Conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: query.slice(0, 80),
        slug: slugify(query),
        userId: req.userId!,
        message: {
          create: {
            content: query,
            role: "User",
          },
        },
      },
    });

    // Step 3 — Prompt Engineering
    const currentPrompt = PROMPT_TEMPLATE.replace(
      "{WEB_SEARCH_RESULTS}",
      JSON.stringify(webSearchResult),
    ).replace("{USER_QUERY}", query);

    // Step 4 — LLM Request
    const result = await openRouterClient.chat.send({
      chatRequest: {
        model: "openai/gpt-5.2",

        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: currentPrompt,
          },
        ],

        maxTokens: 1000,
        stream: true,
      },
    });

    // SSE Headers
    res.header("Cache-Control", "no-cache");
    res.header("Content-Type", "text/event-stream");
    res.header("X-Conversation-Id", conversation.id);

    // Step 5 — Stream Response
    let assistantText = "";

    for await (const chunk of result) {
      const text = chunk.choices?.[0]?.delta?.content;

      if (text) {
        assistantText += text;
        res.write(text);
      }
    }

    // Sources
    const sources = sourcesBlock(webSearchResult);

    res.write(sources);
    res.end();

    // Save assistant message
    await prisma.message.create({
      data: {
        content: assistantText + sources,
        role: "Assistant",
        conversationId: conversation.id,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.post("/perplexity-ask/follow-up", middleware, async (req, res) => {
  try {
    const query = req.body.query;
    const conversationId = req.body.conversationId;

    if (typeof query !== "string" || typeof conversationId !== "string") {
      res.status(400).json({
        message: "Missing query or conversationId",
      });
      return;
    }

    // Existing conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: req.userId!,
      },
      include: {
        message: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      res.status(404).json({
        message: "Conversation not found",
      });
      return;
    }

    // Fresh web search
    const webSearchResponse = await tavilyClient.search(query, {
      searchDepth: "advanced",
    });

    const webSearchResult = webSearchResponse.results;

    // Save user message
    await prisma.message.create({
      data: {
        content: query,
        role: "User",
        conversationId: conversation.id,
      },
    });

    // Conversation history
    const history = conversation.message.map((m) => ({
      role: m.role === "User" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

    // Current prompt
    const currentPrompt = PROMPT_TEMPLATE.replace(
      "{WEB_SEARCH_RESULTS}",
      JSON.stringify(webSearchResult),
    ).replace("{USER_QUERY}", query);

    // Stream AI
    const result = await openRouterClient.chat.send({
      chatRequest: {
        model: "deepseek/deepseek-chat-v3-0324:free",

        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },

          ...history,

          {
            role: "user",
            content: currentPrompt,
          },
        ],

        stream: true,
        maxTokens: 400,
      },
    });

    res.header("Cache-Control", "no-cache");
    res.header("Content-Type", "text/event-stream");
    res.header("X-Conversation-Id", conversation.id);

    let assistantText = "";

    for await (const chunk of result) {
      const text = chunk.choices?.[0]?.delta?.content;

      if (text) {
        assistantText += text;
        res.write(text);
      }
    }

    const sources = sourcesBlock(webSearchResult);

    res.write(sources);
    res.end();

    // Save assistant response
    await prisma.message.create({
      data: {
        content: assistantText + sources,
        role: "Assistant",
        conversationId: conversation.id,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
