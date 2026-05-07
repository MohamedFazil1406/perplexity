import { createClient } from "@/lib/client";

const supabase = createClient();

export function Auth() {
  async function login(provider: "google" | "github") {
    console.log(`Login with ${provider}`);

    await supabase.auth.signInWithOAuth({
      provider,
    });
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.15),transparent_40%)]" />

      <div className="relative z-10">
        <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-xl">
          <div className="text-2xl font-bold tracking-tight">Perplexity AI</div>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>

            <a href="#about" className="hover:text-white transition">
              About
            </a>

            <a href="#auth" className="hover:text-white transition">
              Login
            </a>
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-90px)]">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl">
              AI Powered Search Assistant
            </div>

            <h1 className="mt-8 text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Ask Anything.
              <br />
              <span className="text-zinc-500">Get Instant Answers.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
              Experience a next-generation AI search engine with real-time web
              results, intelligent conversations, and seamless productivity.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-2xl bg-white px-7 py-4 text-black font-semibold transition hover:scale-105 active:scale-95">
                Start Exploring
              </button>

              <button className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-semibold backdrop-blur-xl transition hover:bg-white/10">
                Watch Demo
              </button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="text-3xl font-bold">10K+</div>
                <div className="mt-2 text-sm text-zinc-400">Active Users</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="text-3xl font-bold">AI</div>
                <div className="mt-2 text-sm text-zinc-400">Powered Search</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="text-3xl font-bold">24/7</div>
                <div className="mt-2 text-sm text-zinc-400">Availability</div>
              </div>
            </div>
          </div>

          <div id="auth" className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-1 rounded-4xl bg-linear-to-r from-zinc-700 to-zinc-500 opacity-20 blur-2xl" />

            <div className="relative rounded-4xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
              <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold tracking-tight">
                  Welcome Back
                </h2>

                <p className="mt-3 text-zinc-400">
                  Sign in to continue your AI journey
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => login("google")}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.99]"
                >
                  <span className="text-lg">G</span>
                  Continue with Google
                </button>

                <button
                  onClick={() => login("github")}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-zinc-900 px-5 py-4 font-semibold transition hover:scale-[1.02] hover:bg-zinc-800 active:scale-[0.99]"
                >
                  <span className="text-lg">◉</span>
                  Continue with GitHub
                </button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-4 text-zinc-500">
                    Secure Authentication
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-400">
                Powered by Supabase OAuth with enterprise-grade security and
                seamless login experience.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
