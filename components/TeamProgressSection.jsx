"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

const STATUS_COLORS = {
  available: "var(--success)",
  busy: "var(--warning)",
  away: "var(--danger)",
  offline: "var(--text-dim)",
};

const ROLE_BADGE = {
  admin: { bg: "var(--danger-light)", color: "var(--danger)" },
  manager: { bg: "var(--warning-light)", color: "var(--warning)" },
  member: { bg: "var(--accent-light)", color: "var(--accent)" },
  client: { bg: "rgba(56,189,248,0.1)", color: "var(--info)" },
};

export default function TeamProgressSection({ orgId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/members/status")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data.filter((m) => m.role !== "client"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Real-time status updates
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

    return () => {
      channel.unbind("member-status-update");
    };
  }, [orgId]);

  if (loading) {
    return (
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
          <BarChart3 size={16} color="var(--accent)" />
          Team Progress
        </h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "96px", borderRadius: "var(--radius-lg)", background: "var(--bg-secondary)" }} />
          ))}
        </div>
      </section>
    );
  }

  if (members.length === 0) return null;

  return (
    <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
          <BarChart3 size={16} color="var(--accent)" />
          Team Progress
        </h3>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {members.filter((m) => m.taskStats.total > 0).length} active members
        </span>
      </div>

      <div className="space-y-3">
        {members.map((m) => {
          const { taskStats, status, activeProjects } = m;
          const statusColor = STATUS_COLORS[status?.status] || STATUS_COLORS.offline;

          return (
            <Link
              key={m.id}
              href={`/dashboard/members/${m.id}`}
              style={{
                display: "block",
                padding: "16px 20px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-light)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", height: "36px", width: "36px", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--accent-light)", fontSize: "12px", fontWeight: "bold", color: "var(--accent)" }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        right: "-2px",
                        height: "8px",
                        width: "8px",
                        borderRadius: "50%",
                        border: "2px solid var(--surface)",
                        backgroundColor: statusColor,
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{m.name}</p>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "2px 8px",
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          borderRadius: "4px",
                          background: (ROLE_BADGE[m.role] || ROLE_BADGE.member).bg,
                          color: (ROLE_BADGE[m.role] || ROLE_BADGE.member).color,
                        }}
                      >
                        {m.role}
                      </span>
                    </div>
                    {status?.currentWork && (
                      <p style={{ marginTop: "2px", fontSize: "11px", fontStyle: "italic", color: "var(--text-muted)" }}>
                        "{status.currentWork}"
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      height: "8px",
                      width: "8px",
                      borderRadius: "50%",
                      backgroundColor: statusColor,
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                    {status?.status || "offline"}
                  </span>
                </div>
              </div>

              {/* Task progress bar */}
              {taskStats.total > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Tasks</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {taskStats.done}/{taskStats.total} done ·{" "}
                      {taskStats.completionRate}%
                    </span>
                  </div>
                  <div style={{ display: "flex", height: "6px", overflow: "hidden", borderRadius: "3px", background: "var(--bg-secondary)" }}>
                    {taskStats.done > 0 && (
                      <div
                        style={{
                          background: "var(--success)",
                          transition: "width 0.7s ease",
                          width: `${(taskStats.done / taskStats.total) * 100}%`,
                        }}
                      />
                    )}
                    {taskStats.inProgress > 0 && (
                      <div
                        style={{
                          background: "var(--warning)",
                          transition: "width 0.7s ease",
                          width: `${(taskStats.inProgress / taskStats.total) * 100}%`,
                        }}
                      />
                    )}
                    {taskStats.todo > 0 && (
                      <div
                        style={{
                          background: "var(--text-dim)",
                          transition: "width 0.7s ease",
                          width: `${(taskStats.todo / taskStats.total) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Bottom details */}
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ height: "6px", width: "6px", borderRadius: "50%", background: "var(--success)" }} />
                    Done {taskStats.done}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ height: "6px", width: "6px", borderRadius: "50%", background: "var(--warning)" }} />
                    In Progress {taskStats.inProgress}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ height: "6px", width: "6px", borderRadius: "50%", background: "var(--text-dim)" }} />
                    Todo {taskStats.todo}
                  </span>
                </div>
                {activeProjects.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {activeProjects.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        style={{ height: "8px", width: "8px", borderRadius: "50%", flexShrink: 0, backgroundColor: p.color || "var(--accent)" }}
                        title={p.name}
                      />
                    ))}
                    <span style={{ marginLeft: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
                      {activeProjects.length} project
                      {activeProjects.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
