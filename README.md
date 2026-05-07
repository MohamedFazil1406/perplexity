# Perplexity AI

A modern AI-powered search and conversation platform inspired by Perplexity AI.

PerplexAI combines real-time web search with advanced LLM reasoning to deliver accurate, contextual, and intelligent responses in a beautiful conversational interface.

---

## ✨ Features

- 🔍 Real-time web search using Tavily
- 🤖 AI-powered responses using OpenRouter
- 💬 Persistent AI conversations
- ⚡ Streaming responses
- 🔐 OAuth Authentication with Supabase
- 🧠 Context-aware follow-up chats
- 🌐 Google & GitHub login
- 📚 Conversation history
- 🎨 Modern Perplexity-style UI
- ⚙️ Bun-powered ultra-fast backend

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router

### Backend
- Bun
- Express
- Prisma

### AI & Search
- OpenRouter
- Tavily Search API

### Database & Authentication
- Supabase
- PostgreSQL

---

# 🧠 How It Works

1. User sends a query
2. Tavily performs live web search
3. Search results are injected into the AI prompt
4. OpenRouter generates intelligent responses
5. AI response streams back to frontend in real time
6. Conversations are stored in database
7. Follow-up questions maintain chat context

---

# 🔐 Authentication

PerplexAI uses Supabase OAuth authentication with:

- Google Login
- GitHub Login

User sessions are securely synced between frontend and backend using JWT-based authentication.

---

# ⚡ Streaming AI Responses

The backend streams AI-generated responses token-by-token to create a real-time conversational experience similar to Perplexity AI and ChatGPT.

---

# 📁 Project Structure

```bash
perplexity/
│
├── Frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── lib/
│
├── Backend/
│   ├── middleware/
│   ├── prisma/
│   ├── routes/
│   ├── prompt/
│   └── db/
│
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/MohamedFazil1406/perplexity.git
```

---

# 📦 Install Dependencies

## Frontend

```bash
cd Frontend
bun install
```

## Backend

```bash
cd Backend
bun install
```

---

# ⚙️ Environment Variables

## Backend `.env`

```env
OPENROUTER_API_KEY=
TAVILY_API_KEY=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DATABASE_URL=
```

---

## Frontend `.env`

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

---

# 🗄️ Prisma Setup

```bash
bunx prisma generate
bunx prisma migrate dev
```

---

# ▶️ Run Frontend

```bash
cd Frontend
bun run dev
```

---

# ▶️ Run Backend

```bash
cd Backend
bun index.ts
```

---

# 🌐 API Endpoints

## Authentication Protected Routes

### Get Conversations

```http
GET /conversations
```

---

### Get Single Conversation

```http
GET /conversation/:conversationId
```

---

### Ask AI

```http
POST /perplexity-ask
```

Body:

```json
{
  "query": "What is quantum computing?"
}
```

---

### Follow-up Question

```http
POST /perplexity-ask/follow-up
```

---

# 🧩 AI Pipeline

```text
User Query
   ↓
Tavily Web Search
   ↓
Prompt Engineering
   ↓
OpenRouter LLM
   ↓
Streaming Response
   ↓
Frontend Rendering
```

---

# 🎨 UI Highlights

- Glassmorphism dark theme
- Responsive design
- Perplexity-inspired experience
- Streaming answer interface
- Sidebar conversation history

---

# 🔥 Future Improvements

- Markdown rendering
- AI citations UI
- Image generation support
- Multi-model switching
- Voice input
- File upload support
- Semantic search
- Vector embeddings

---

# 📜 License

MIT License

---

# 👨‍💻 Author

Mohamed Fazil

GitHub:
https://github.com/MohamedFazil1406
