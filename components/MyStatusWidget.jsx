"use client";

import { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  { value: "available", label: "Available", color: "var(--success)", emoji: "🟢" },
  { value: "busy", label: "Busy", color: "var(--warning)", emoji: "🟡" },
  { value: "away", label: "Away", color: "var(--danger)", emoji: "🔴" },
  { value: "offline", label: "Offline", color: "var(--text-dim)", emoji: "⚫" },
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
    <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>My Status</h3>
        {updatedAt && (
          <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
            Updated {timeAgo(updatedAt)}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Status dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              height: "10px",
              width: "10px",
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: currentOption.color
            }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              flex: 1,
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "9px 12px",
              fontSize: "14px",
              color: "var(--text-primary)",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
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
          <label style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            What are you working on?
          </label>
          <input
            type="text"
            value={currentWork}
            onChange={(e) => setCurrentWork(e.target.value)}
            placeholder="e.g. Working on homepage design"
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "9px 12px",
              fontSize: "14px",
              color: "var(--text-primary)",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdate();
            }}
          />
        </div>

        {/* Update button */}
        <button
          onClick={handleUpdate}
          disabled={saving}
          style={{
            width: "100%",
            borderRadius: "var(--radius-md)",
            padding: "9px 12px",
            fontSize: "13px",
            fontWeight: 600,
            transition: "all 0.15s",
            background: saved ? "var(--success-light)" : "var(--accent)",
            color: saved ? "var(--success)" : "#fff",
            border: saved ? "1px solid var(--success-light)" : "1px solid var(--accent)",
            opacity: saving ? 0.7 : 1,
            cursor: "pointer",
          }}
        >
          {saving ? "Saving..." : saved ? "✓ Updated" : "Update Status"}
        </button>
      </div>
    </section>
  );
}
