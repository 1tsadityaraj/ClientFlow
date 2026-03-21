"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusherClient";

const COLUMNS = [
  { key: "available", label: "Available", color: "var(--success)" },
  { key: "busy", label: "Busy", color: "var(--warning)" },
  { key: "away", label: "Away", color: "var(--danger)" },
  { key: "offline", label: "Offline", color: "var(--text-dim)" },
];

export default function WorkloadView({ orgId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/members/status")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!orgId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`org-${orgId}`);

    channel.bind("member-status-update", (data) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === data.userId
            ? {
                ...m,
                status: {
                  ...m.status,
                  status: data.status,
                  currentWork: data.currentWork,
                },
              }
            : m
        )
      );
    });

    return () => channel.unbind("member-status-update");
  }, [orgId]);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}
          >
            <div style={{ height: "24px", width: "80px", borderRadius: "4px", background: "var(--bg-secondary)", marginBottom: "16px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ height: "80px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      {COLUMNS.map((col) => {
        const colMembers = members.filter(
          (m) => (m.status?.status || "offline") === col.key
        );

        return (
          <div
            key={col.key}
            style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span
                style={{ height: "10px", width: "10px", borderRadius: "50%", backgroundColor: col.color }}
              />
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{col.label}</h3>
              <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text-muted)", fontWeight: "bold" }}>
                {colMembers.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "80px" }}>
              {colMembers.length === 0 && (
                <p style={{ textAlign: "center", fontSize: "10px", color: "var(--text-muted)", padding: "24px 0" }}>
                  No members
                </p>
              )}
              {colMembers.map((m) => (
                <Link
                  key={m.id}
                  href={`/dashboard/members/${m.id}`}
                  style={{
                    display: "block",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    transition: "all 0.15s",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-light)";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ display: "flex", height: "32px", width: "32px", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--accent-light)", fontSize: "12px", fontWeight: "bold", color: "var(--accent)" }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                        {m.name}
                      </p>
                      <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "10px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                        {m.role}
                      </p>
                    </div>
                  </div>
                  {m.status?.currentWork && (
                    <p style={{ marginTop: "8px", fontSize: "11px", fontStyle: "italic", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      "{m.status.currentWork}"
                    </p>
                  )}
                  <div style={{ marginTop: "8px", display: "flex", gap: "12px", fontSize: "10px", color: "var(--text-muted)" }}>
                    <span>{m.taskStats?.total || 0} tasks</span>
                    <span>{m.activeProjects?.length || 0} projects</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
