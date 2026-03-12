"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid credentials");
    } else if (res?.ok) {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/50">
        <h1 className="text-xl font-semibold text-zinc-50">Log in</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Access your ClientFlow workspace.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 focus:border-indigo-500"
            />
          </div>
          {error && (
            <p className="text-xs text-rose-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-indigo-500 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
        <p className="mt-4 text-xs text-zinc-500">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-300 hover:text-indigo-200"
          >
            Create a workspace
          </Link>
        </p>
      </div>
    </main>
  );
}

