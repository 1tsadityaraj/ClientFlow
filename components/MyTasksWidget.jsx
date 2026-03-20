"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const PRIORITY_COLORS = {
  HIGH: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  LOW: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
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
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
          <CheckCircle2 className="h-4 w-4 text-brand-primary" />
          My Tasks
        </h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800/50" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          <CheckCircle2 className="h-4 w-4 text-brand-primary" />
          My Tasks
        </h3>
        {totalPending > 0 && (
          <span className="text-[10px] text-zinc-500">
            {totalPending} pending
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-zinc-500">No pending tasks 🎉</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/dashboard/projects/${task.projectId}`}
              className="group flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/30 p-3 transition-all hover:border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800/40"
            >
              <span
                className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: task.project?.color || "#6366f1",
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-white">
                  {task.title}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  {task.project?.name}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                    PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM
                  }`}
                >
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span
                    className={`text-[10px] ${
                      formatDueDate(task.dueDate) === "Overdue"
                        ? "text-rose-400"
                        : "text-zinc-500"
                    }`}
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
