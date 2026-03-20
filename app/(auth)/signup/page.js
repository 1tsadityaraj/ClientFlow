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
  const [showLoginLink, setShowLoginLink] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const checkSlug = async (currentSlug) => {
    if (!currentSlug) {
      setSlugAvailable(null);
      return;
    }
    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/orgs/check-slug?slug=${currentSlug}`);
      if (res.ok) {
        const data = await res.json();
        setSlugAvailable(data.available);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingSlug(false);
    }
  };

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
      setError(data.error || "Something went wrong. Please try again.");
      
      if (res.status === 409 && data.error?.includes('email')) {
        setError('An account with this email already exists.');
        setShowLoginLink(true);
      }
      return;
    }

    window.location.href = "/onboarding";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/60 p-8 shadow-xl shadow-black/50">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Get started
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">
          Create your first workspace
        </h1>
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                  Agency name
                </label>
                <input
                  type="text"
                  required
                  value={form.orgName}
                  onChange={(e) => {
                    updateField("orgName", e.target.value);
                    const generated = e.target.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 30);
                    updateField("orgSlug", generated);
                    setSlugAvailable(null);
                  }}
                  onBlur={() => checkSlug(form.orgSlug)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                  Workspace slug
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-500">
                  <span className="hidden text-xs text-zinc-500 sm:inline">
                    clientflow.app/
                  </span>
                  <input
                    type="text"
                    required
                    value={form.orgSlug}
                    onChange={(e) => {
                      updateField(
                        "orgSlug",
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      );
                      setSlugAvailable(null);
                    }}
                    onBlur={(e) => checkSlug(e.target.value)}
                    className="flex-1 border-none bg-transparent text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none"
                  />
                  {checkingSlug && <span className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">checking...</span>}
                  {!checkingSlug && slugAvailable === true && <span className="text-xs text-emerald-500">✓ Available</span>}
                  {!checkingSlug && slugAvailable === false && <span className="text-xs text-rose-500">✗ Already taken</span>}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                  Work email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 12,
            }}>
              {error}
              {showLoginLink && (
                <span>
                  {' '}
                  <a href="/login" style={{ color: '#7c6af7', fontWeight: 600 }}>
                    Sign in instead →
                  </a>
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type={step === 2 ? "submit" : "button"}
              disabled={loading || (step === 1 && slugAvailable === false)}
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

