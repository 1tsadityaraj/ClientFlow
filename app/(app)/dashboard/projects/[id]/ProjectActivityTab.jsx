"use client";

import { useState, useEffect, useCallback } from "react";
import { getActivityDescription, getActivityMeta } from "@/lib/activity";
import { Clock, User } from "lucide-react";

export default function ProjectActivityTab({ projectId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch(`/api/activity?projectId=${projectId}&limit=50`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchActivity();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
    
    // Yesterday logic
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    // Mar 14 logic
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-8 py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-8 w-8 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-400">
        {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900">
          <Clock className="h-6 w-6 text-zinc-600" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">No activity yet</h3>
        <p className="mt-1 text-xs text-zinc-500">Start by creating a task or adding a comment</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 py-4">
      {/* Vertical line connecting entries */}
      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-zinc-200 dark:bg-zinc-800" />

      {logs.map((log) => {
        const { icon, color } = getActivityMeta(log.action);
        const description = getActivityDescription(log);

        return (
          <div key={log.id} className="relative flex gap-4">
            {/* Action Icon */}
            <div 
              className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-900 bg-white dark:bg-zinc-950 shadow-sm"
              style={{ color }}
            >
              <span className="text-[10px] font-bold">{icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                {log.user?.avatar ? (
                  <img 
                    src={log.user.avatar} 
                    alt={log.user.name} 
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                    <User className="h-3 w-3" />
                  </div>
                )}
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{log.user?.name}</span>
                <span className="text-[10px] text-zinc-500">•</span>
                <time className="text-[10px] text-zinc-500">{formatTime(log.createdAt)}</time>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
              <div className="mt-4 border-b border-zinc-900/50" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
