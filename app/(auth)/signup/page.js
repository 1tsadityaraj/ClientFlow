"use client";

import { useState } from "react";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    orgName: "",
    orgSlug: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      let errorMessage = data.message || data.error || "Something went wrong";
      
      if (res.status === 409) {
        errorMessage = "An account with this email/slug already exists";
      } else if (res.status === 503) {
        errorMessage = "Service temporarily unavailable, please try again later";
      }
      
      setError(errorMessage);
      return;
    }

    window.location.href = "/onboarding";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/50">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Get started
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-50">
          Create your first workspace
        </h1>
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Agency name
                </label>
                <input
                  type="text"
                  required
                  value={form.orgName}
                  onChange={(e) => updateField("orgName", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Workspace slug
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-500">
                  <span className="hidden text-xs text-zinc-500 sm:inline">
                    clientflow.app/
                  </span>
                  <input
                    type="text"
                    required
                    value={form.orgSlug}
                    onChange={(e) =>
                      updateField(
                        "orgSlug",
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    className="flex-1 border-none bg-transparent text-sm text-zinc-50 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Work email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-rose-400">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type={step === 2 ? "submit" : "button"}
              disabled={loading}
              onClick={step === 1 ? () => setStep(2) : undefined}
              className="rounded-full bg-indigo-500 px-5 py-2 text-xs font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {step === 2 ? (loading ? "Creating..." : "Create workspace") : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

