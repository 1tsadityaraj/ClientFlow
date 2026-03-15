"use client";

import { useState, useEffect } from "react";
import { Can } from "../../../../../components/Can";
import { Clock } from "lucide-react";

export default function ProjectActivityTab({ projectId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadLogs() {
    const res = await fetch(`/api/projects/${projectId}/audit`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setError("Failed to load audit logs");
      return;
    }
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadLogs().finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-zinc-800" />
            <div className="h-16 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <Can permission="manageMembers">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-brand-primary" />
          <h2 className="text-sm font-medium text-zinc-300">Activity Timeline</h2>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
          {logs.map((log) => {
            const meta = log.metadata ? JSON.parse(log.metadata) : {};
            const actionText = meta.message || `${log.user?.name || "User"} performed ${log.action} on ${log.entity}`;

            return (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <span className="text-[10px] font-bold text-zinc-400">
                    {(log.user?.name || "U")[0].toUpperCase()}
                  </span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-sm transition-all hover:border-brand-primary/50">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-zinc-200 text-xs">{log.user?.name}</div>
                    <time className="text-[10px] text-zinc-500">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                    </time>
                  </div>
                  <div className="text-sm text-zinc-400">
                    {actionText}
                  </div>
                </div>
              </div>
            );
          })}

          {logs.length === 0 && (
            <div className="relative text-center py-6">
              <p className="text-xs text-zinc-500">No recent activity.</p>
            </div>
          )}
        </div>
      </div>
    </Can>
  );
}
