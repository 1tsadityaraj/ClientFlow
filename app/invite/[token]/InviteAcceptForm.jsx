"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function InviteAcceptForm({ token, email }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/invites/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      setLoading(false);
      setError(data.error || "Something went wrong while accepting the invite.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email || email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (signInResult?.error) {
      setLoading(false);
      setError("Account created but automatic sign-in failed. Please log in manually.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
          Full name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
          Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none focus:border-indigo-500"
        />
        <p className="mt-1 text-[10px] text-zinc-500">
          Minimum 8 characters.
        </p>
      </div>
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-full bg-indigo-500 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Accepting..." : "Accept invite"}
      </button>
    </form>
  );
}

