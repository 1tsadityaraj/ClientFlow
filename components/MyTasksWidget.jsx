"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const PRIORITY_COLORS = {
  HIGH: { color: "var(--danger)", bg: "var(--danger-light)", border: "var(--danger-light)" },
  MEDIUM: { color: "var(--warning)", bg: "var(--warning-light)", border: "var(--warning-light)" },
  LOW: { color: "var(--success)", bg: "var(--success-light)", border: "var(--success-light)" },
};

function formatDueDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  return `Due ${day}`;
}

export default function MyTasksWidget() {
  const [tasks, setTasks] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks/my-tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setTotalPending(data.totalPending || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
          <CheckCircle2 size={16} color="var(--accent)" />
          My Tasks
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "48px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)" }} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
          <CheckCircle2 size={16} color="var(--accent)" />
          My Tasks
        </h3>
        {totalPending > 0 && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {totalPending} pending
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No pending tasks 🎉</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/dashboard/projects/${task.projectId}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                transition: "all 0.15s",
                textDecoration: "none"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-light)";
                e.currentTarget.style.background = "var(--surface-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
            >
              <span
                style={{
                  marginTop: "4px",
                  height: "8px",
                  width: "8px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: task.project?.color || "var(--accent)",
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                  {task.title}
                </p>
                <p style={{ marginTop: "2px", fontSize: "11px", color: "var(--text-muted)" }}>
                  {task.project?.name}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    border: "1px solid",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM).color,
                    background: (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM).bg,
                    borderColor: (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM).border,
                  }}
                >
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span
                    style={{
                      fontSize: "10px",
                      color: formatDueDate(task.dueDate) === "Overdue" ? "var(--danger)" : "var(--text-muted)",
                    }}
                  >
                    {formatDueDate(task.dueDate)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
