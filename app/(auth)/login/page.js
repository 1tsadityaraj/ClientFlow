"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const showDemoHint = process.env.NEXT_PUBLIC_SHOW_DEMO_HINT === "true";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setAttempts((prev) => prev + 1);
        if (res.error === "CredentialsSignin") {
          setError("Invalid email or password");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/60 p-8 shadow-xl shadow-black/50 transition-all hover:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/70">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">Log in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
          Access your ClientFlow workspace.
        </p>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                Email
              </label>
            </div>
            <input
              type="email"
              placeholder="alice@pixel.co"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-600 outline-none ring-0 focus:border-brand-primary"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <Link 
                href="#" 
                className="text-[10px] font-medium text-brand-primary hover:text-brand-primary/80"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-600 outline-none ring-0 focus:border-brand-primary"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
              {attempts >= 3 && showDemoHint && (
                <p className="mt-1 text-[10px] opacity-80">
                  Having trouble? Try <span className="font-semibold text-rose-300">alice@pixel.co</span> with <span className="font-semibold text-rose-300">password123</span> for the demo.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-brand-primary py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-primary hover:text-brand-primary/80 underline-offset-4 hover:underline"
          >
            Create a workspace
          </Link>
        </p>
      </div>
    </main>
  );
}

