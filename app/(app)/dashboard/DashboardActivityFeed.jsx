"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getActivityDescription, getActivityMeta } from "@/lib/activity";
import { Activity, User as UserIcon } from "lucide-react";

export default function DashboardActivityFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/activity?limit=10");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard activity:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  function formatTimeShort(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "yday";
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          <Activity className="h-4 w-4 text-brand-primary" />
          Recent Activity
        </h3>
        <Link
          href="/dashboard/activity"
          className="text-[10px] font-medium text-brand-primary hover:text-brand-primary/80"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 flex-1 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))
        ) : logs.length > 0 ? (
          logs.map((log) => {
            const { icon, color } = getActivityMeta(log.action);
            const description = getActivityDescription(log);
            
            return (
              <div key={log.id} className="flex items-center gap-3 group">
                <div className="relative shrink-0">
                  {log.user?.avatar ? (
                    <img 
                      src={log.user.avatar} 
                      alt={log.user.name} 
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                      <UserIcon className="h-3 w-3" />
                    </div>
                  )}
                  <span 
                    className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white dark:bg-zinc-950 text-[7px] border border-zinc-900"
                    style={{ color }}
                  >
                    {icon}
                  </span>
                </div>
                
                <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
                  <p className="truncate text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 mr-1">{log.user?.name}</span>
                    {description}
                  </p>
                  <time className="shrink-0 text-[9px] text-zinc-500 font-medium uppercase">
                    {formatTimeShort(log.createdAt)}
                  </time>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-4 text-center text-xs text-zinc-500">No recent activity</p>
        )}
      </div>
    </section>
  );
}
