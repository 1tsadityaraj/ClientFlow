"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusherClient";

const COLUMNS = [
  { key: "available", label: "Available", color: "#22c55e" },
  { key: "busy", label: "Busy", color: "#eab308" },
  { key: "away", label: "Away", color: "#ef4444" },
  { key: "offline", label: "Offline", color: "#6b7280" },
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 animate-pulse"
          >
            <div className="h-6 w-20 rounded bg-zinc-800 mb-4" />
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-zinc-800/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const colMembers = members.filter(
          (m) => (m.status?.status || "offline") === col.key
        );

        return (
          <div
            key={col.key}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: col.color }}
              />
              <h3 className="text-sm font-semibold text-zinc-200">{col.label}</h3>
              <span className="ml-auto text-[10px] text-zinc-500">
                {colMembers.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[80px]">
              {colMembers.length === 0 && (
                <p className="text-center text-[10px] text-zinc-600 py-6">
                  No members
                </p>
              )}
              {colMembers.map((m) => (
                <Link
                  key={m.id}
                  href={`/dashboard/members/${m.id}`}
                  className="block rounded-xl border border-zinc-800/50 bg-zinc-950/40 p-3 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 text-xs font-bold text-violet-300">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-zinc-200">
                        {m.name}
                      </p>
                      <p className="truncate text-[10px] text-zinc-500 capitalize">
                        {m.role}
                      </p>
                    </div>
                  </div>
                  {m.status?.currentWork && (
                    <p className="mt-2 text-[10px] italic text-zinc-500 line-clamp-2">
                      "{m.status.currentWork}"
                    </p>
                  )}
                  <div className="mt-2 flex gap-3 text-[10px] text-zinc-500">
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
