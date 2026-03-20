"use client";

import { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  { value: "available", label: "Available", color: "#22c55e", emoji: "🟢" },
  { value: "busy", label: "Busy", color: "#eab308", emoji: "🟡" },
  { value: "away", label: "Away", color: "#ef4444", emoji: "🔴" },
  { value: "offline", label: "Offline", color: "#6b7280", emoji: "⚫" },
];

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function MyStatusWidget() {
  const [status, setStatus] = useState("available");
  const [currentWork, setCurrentWork] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/members/status")
      .then((r) => r.json())
      .then((data) => {
        // Find current user — the API returns all members,
        // but we need the PATCH to know it's "me"
        // Actually we'll fetch /api/members/status PATCH to get own status
        // For now, just load from GET and find self
        // We'll use the session in a smarter way
      })
      .catch(() => {});

    // Simpler: just fetch own status by calling PATCH with no body
    // ... or we do a dedicated approach
    // Let's call GET and match by checking session
    fetchMyStatus();
  }, []);

  async function fetchMyStatus() {
    try {
      const res = await fetch("/api/members/status");
      if (!res.ok) return;
      const members = await res.json();
      // Get session to find self
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (!session?.user?.id) return;
      const me = members.find((m) => m.id === session.user.id);
      if (me?.status) {
        setStatus(me.status.status || "available");
        setCurrentWork(me.status.currentWork || "");
        setUpdatedAt(me.status.updatedAt);
      }
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }

  async function handleUpdate() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/members/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, currentWork }),
      });
      if (res.ok) {
        const data = await res.json();
        setUpdatedAt(data.updatedAt);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setSaving(false);
    }
  }

  const currentOption =
    STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">My Status</h3>
        {updatedAt && (
          <span className="text-[10px] text-zinc-500">
            Updated {timeAgo(updatedAt)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Status dropdown */}
        <div className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: currentOption.color }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 outline-none transition-all focus:border-brand-primary"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.emoji} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Current work input */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            What are you working on?
          </label>
          <input
            type="text"
            value={currentWork}
            onChange={(e) => setCurrentWork(e.target.value)}
            placeholder="e.g. Working on homepage design"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 outline-none transition-all focus:border-brand-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdate();
            }}
          />
        </div>

        {/* Update button */}
        <button
          onClick={handleUpdate}
          disabled={saving}
          className={`w-full rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            saved
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-brand-primary/15 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/25"
          } disabled:opacity-50`}
        >
          {saving ? "Saving..." : saved ? "✓ Updated" : "Update Status"}
        </button>
      </div>
    </section>
  );
}
