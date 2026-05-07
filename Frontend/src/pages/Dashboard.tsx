import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/client";
import { BACKEND_URL } from "@/config";

const supabase = createClient();

interface Conversation {
  id: string;
  title: string;
  slug: string;
}

export function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  // =========================================
  // Get User
  // =========================================

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    getUser();
  }, [navigate]);

  // =========================================
  // Fetch Conversations
  // =========================================

  useEffect(() => {
    async function fetchConversations() {
      if (!user) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) return;

        const response = await fetch(`${BACKEND_URL}/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        setConversations(data.conversations || []);
      } catch (error) {
        console.error(error);
      }
    }

    fetchConversations();
  }, [user]);

  // =========================================
  // Ask AI
  // =========================================

  async function handleAsk() {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setAnswer("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/perplexity-ask`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          query,
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      let finalText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        // remove sources block
        const cleanedChunk = chunk.replace(/<SOURCES>[\s\S]*?<\/SOURCES>/g, "");

        finalText += cleanedChunk;

        setAnswer(finalText);
      }

      setQuery("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // =========================================
  // Logout
  // =========================================

  async function handleLogout() {
    await supabase.auth.signOut();

    navigate("/auth");
  }

  // =========================================
  // Loading Screen
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}

      <aside className="hidden w-[320px] flex-col border-r border-white/10 bg-zinc-950 md:flex">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black">PerplexAI</h1>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
            >
              Logout
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-zinc-500">Logged in as</div>

            <div className="mt-1 truncate font-medium">{user?.email}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Conversations
          </div>

          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className="w-full rounded-2xl border border-white/5 bg-white/3 p-4 text-left hover:bg-white/6"
              >
                <div className="line-clamp-1 font-medium">
                  {conversation.title}
                </div>

                <div className="mt-1 line-clamp-1 text-sm text-zinc-500">
                  /{conversation.slug}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}

      <main className="flex flex-1 flex-col">
        <header className="border-b border-white/10 px-6 py-5">
          <h2 className="text-2xl font-bold">AI Search Assistant</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Real-time web powered intelligent answers
          </p>
        </header>

        <div className="flex flex-1 flex-col items-center px-6 py-10">
          <div className="w-full max-w-4xl">
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-black leading-tight tracking-tight">
                Ask anything.
                <br />
                <span className="text-zinc-500">Search the web with AI.</span>
              </h1>
            </div>

            {/* Input Box */}

            <div className="rounded-4xl border border-white/10 bg-white/3 p-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask PerplexAI anything..."
                className="min-h-35 w-full resize-none rounded-3xl bg-transparent p-4 text-lg outline-none placeholder:text-zinc-600"
              />

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <div className="rounded-full bg-green-500/20 px-3 py-1 text-green-400">
                    Live Web Search
                  </div>

                  <div className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-400">
                    GPT-5.2
                  </div>
                </div>

                <button
                  onClick={handleAsk}
                  disabled={isLoading}
                  className="rounded-2xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
                >
                  {isLoading ? "Thinking..." : "Ask AI"}
                </button>
              </div>
            </div>

            {/* AI Response */}

            {answer && (
              <div className="mt-8 rounded-4xl border border-white/10 bg-white/3 p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-400" />

                  <div className="text-sm font-medium text-zinc-400">
                    AI Response
                  </div>
                </div>

                <div className="whitespace-pre-wrap leading-8 text-zinc-200">
                  {answer}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
