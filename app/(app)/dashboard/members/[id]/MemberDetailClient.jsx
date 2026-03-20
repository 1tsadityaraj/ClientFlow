"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Layers } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

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
  client: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const PRIORITY_COLORS = {
  HIGH: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  LOW: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export default function MemberDetailClient({ member, taskStats, activeTasks, projects }) {
  const statusColor = STATUS_COLORS[member.status?.status] || STATUS_COLORS.offline;
  const memberSince = new Date(member.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Back link */}
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Members
        </Link>

        {/* Profile header */}
        <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 text-xl font-bold text-violet-300 shadow-lg">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <span
                className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-3 border-zinc-900"
                style={{ backgroundColor: statusColor, borderWidth: 3 }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight">{member.name}</h1>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    ROLE_BADGE[member.role] || ROLE_BADGE.member
                  }`}
                >
                  {member.role}
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="text-xs text-zinc-500 capitalize">
                    {member.status?.status || "offline"}
                  </span>
                </span>
              </div>
              {member.status?.currentWork && (
                <p className="mt-1 text-sm italic text-zinc-400">
                  "{member.status.currentWork}"
                </p>
              )}
              <p className="mt-2 text-xs text-zinc-500">
                {member.email} · Member since {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Task Overview Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Total" value={taskStats.total} icon={<Layers className="h-4 w-4 text-violet-400" />} />
          <StatBox label="Done" value={taskStats.done} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
          <StatBox label="In Progress" value={taskStats.inProgress} icon={<Clock className="h-4 w-4 text-amber-400" />} />
          <StatBox label="Todo" value={taskStats.todo} icon={<AlertCircle className="h-4 w-4 text-zinc-400" />} />
        </div>

        {/* Completion bar */}
        <div className="mt-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Overall completion</span>
            <span className="text-xs font-semibold text-zinc-200">{taskStats.completionRate}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-brand-primary transition-all duration-700"
              style={{ width: `${taskStats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              Active Tasks
            </h2>
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
              {activeTasks.map((task, i) => (
                <Link
                  key={task.id}
                  href={`/dashboard/projects/${task.projectId}`}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/40 ${
                    i < activeTasks.length - 1 ? "border-b border-zinc-800/50" : ""
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.project?.color || "#6366f1" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">{task.title}</p>
                    <p className="text-[10px] text-zinc-500">{task.project?.name}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${
                      PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                    {task.status.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              Projects
            </h2>
            <div className="space-y-2">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-5 py-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
                >
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.color || "#6366f1" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200">{p.name}</p>
                    <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-zinc-800 max-w-xs">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.progress}%`,
                          backgroundColor: p.color || "#6366f1",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">
                    {p.progress}% complete
                  </span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-400">
                    {p.role}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {label}
        </span>
        {icon}
      </div>
      <p className="text-2xl font-bold tracking-tight text-zinc-50">{value}</p>
    </div>
  );
}
