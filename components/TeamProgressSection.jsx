"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

const STATUS_COLORS = {
  available: "#22c55e",
  busy: "#eab308",
  away: "#ef4444",
  offline: "#6b7280",
};

const ROLE_BADGE = {
  admin: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  manager: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  member: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  client: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
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
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-4">
          <BarChart3 className="h-4 w-4 text-violet-400" />
          Team Progress
        </h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800/50" />
          ))}
        </div>
      </section>
    );
  }

  if (members.length === 0) return null;

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <BarChart3 className="h-4 w-4 text-violet-400" />
          Team Progress
        </h3>
        <span className="text-xs text-zinc-500">
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
              className="block rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950/40 p-4 transition-all hover:border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50/90 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/60"
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 text-xs font-bold text-violet-300">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950"
                      style={{ backgroundColor: statusColor }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{m.name}</p>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                          ROLE_BADGE[m.role] || ROLE_BADGE.member
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                    {status?.currentWork && (
                      <p className="mt-0.5 text-[11px] italic text-zinc-500">
                        "{status.currentWork}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="text-[10px] text-zinc-500 capitalize">
                    {status?.status || "offline"}
                  </span>
                </div>
              </div>

              {/* Task progress bar */}
              {taskStats.total > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-zinc-500">Tasks</span>
                    <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                      {taskStats.done}/{taskStats.total} done ·{" "}
                      {taskStats.completionRate}%
                    </span>
                  </div>
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    {taskStats.done > 0 && (
                      <div
                        className="bg-emerald-500 transition-all duration-700"
                        style={{
                          width: `${(taskStats.done / taskStats.total) * 100}%`,
                        }}
                      />
                    )}
                    {taskStats.inProgress > 0 && (
                      <div
                        className="bg-amber-500 transition-all duration-700"
                        style={{
                          width: `${(taskStats.inProgress / taskStats.total) * 100}%`,
                        }}
                      />
                    )}
                    {taskStats.todo > 0 && (
                      <div
                        className="bg-zinc-600 transition-all duration-700"
                        style={{
                          width: `${(taskStats.todo / taskStats.total) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Bottom details */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-4 text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Done {taskStats.done}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    In Progress {taskStats.inProgress}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    Todo {taskStats.todo}
                  </span>
                </div>
                {activeProjects.length > 0 && (
                  <div className="flex items-center gap-1">
                    {activeProjects.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color || "#6366f1" }}
                        title={p.name}
                      />
                    ))}
                    <span className="ml-1 text-[10px] text-zinc-500">
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
