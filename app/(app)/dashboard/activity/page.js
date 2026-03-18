"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getActivityDescription, getActivityMeta } from "@/lib/activity";
import Sidebar from "@/components/Sidebar";
import { 
  Activity, 
  Filter, 
  Download, 
  ChevronDown, 
  User as UserIcon, 
  Clock,
  Search,
  Calendar
} from "lucide-react";

export default function ActivityLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  
  // Filters
  const [projectId, setProjectId] = useState("");
  const [userId, setUserId] = useState("");
  const [actionType, setActionType] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const isAdminOrManager = session?.user?.role === "admin" || session?.user?.role === "manager";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !isAdminOrManager) {
      router.push("/dashboard");
    }
  }, [status, isAdminOrManager, router]);

  const fetchInitialData = useCallback(async () => {
    try {
      const [projRes, memRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/members")
      ]);
      if (projRes.ok) setProjects(await projRes.json());
      if (memRes.ok) setMembers(await memRes.json());
    } catch (err) {
      console.error("Failed to fetch filter data:", err);
    }
  }, []);

  const fetchLogs = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      let url = `/api/activity?limit=50`;
      if (projectId) url += `&projectId=${projectId}`;
      if (userId) url += `&userId=${userId}`;
      if (actionType) url += `&actionType=${actionType}`;
      if (dateRange) url += `&dateRange=${dateRange}`;
      if (isLoadMore && cursor) url += `&cursor=${cursor}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setLogs(prev => [...prev, ...data.logs]);
        } else {
          setLogs(data.logs || []);
        }
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [projectId, userId, actionType, cursor]);

  useEffect(() => {
    if (status === "authenticated" && isAdminOrManager) {
      fetchInitialData();
      fetchLogs();
    }
  }, [status, isAdminOrManager, fetchInitialData, projectId, userId, actionType, dateRange]); // Re-fetch on filter change

  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function handleExportCSV() {
    if (!isAdminOrManager) return;

    const headers = ["Date", "User", "Action", "Project", "Details"];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.user?.name || "Unknown",
      log.action,
      log.projectId || "Org-wide",
      getActivityDescription(log)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (status === "loading" || !isAdminOrManager) {
    return null; // Or a loading spinner
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Sidebar - Note: Sidebar component needs projects, but we might not have all of them here easily if we don't fetch them specifically for the sidebar. Dashboard page does it. */}
      {/* Assuming Sidebar handles its own if needed or we pass the projects we fetched */}
      <Sidebar session={session} projects={projects} org={{ name: session.user.orgName }} />

      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/80 px-6 py-6 backdrop-blur-xl lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Workspace</p>
              <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
            </div>
            {session.user.role === "admin" && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-700"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 pr-10 text-xs font-medium text-zinc-300 transition-all focus:border-brand-primary focus:outline-none"
              >
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 pr-10 text-xs font-medium text-zinc-300 transition-all focus:border-brand-primary focus:outline-none"
              >
                <option value="">All Users</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 pr-10 text-xs font-medium text-zinc-300 transition-all focus:border-brand-primary focus:outline-none"
              >
                <option value="">All Actions</option>
                <option value="tasks">Tasks</option>
                <option value="files">Files</option>
                <option value="comments">Comments</option>
                <option value="members">Members</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 pr-10 text-xs font-medium text-zinc-300 transition-all focus:border-brand-primary focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800/80 text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="px-5 py-4 font-semibold">Activity</th>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {logs.map((log) => {
                  const { icon, color } = getActivityMeta(log.action);
                  const description = getActivityDescription(log);

                  return (
                    <tr key={log.id} className="group transition-colors hover:bg-zinc-800/30">
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4">
                          <div 
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-xs shadow-sm"
                            style={{ color }}
                          >
                            {icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-zinc-200">{description}</p>
                            <p className="mt-0.5 text-[10px] text-zinc-500 uppercase tracking-tight">
                              {log.entityType} • {log.projectId ? "Project" : "Org"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2.5">
                          {log.user?.avatar ? (
                            <img src={log.user.avatar} className="h-6 w-6 rounded-full" alt="" />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                              {log.user?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <span className="text-xs font-medium text-zinc-300">{log.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-zinc-300">{formatRelativeTime(log.createdAt)}</span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {loading && (
              <div className="py-20 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                <p className="mt-4 text-xs text-zinc-500">Loading activity...</p>
              </div>
            )}

            {!loading && logs.length === 0 && (
              <div className="py-20 text-center">
                <Activity className="mx-auto h-10 w-10 text-zinc-700" />
                <h3 className="mt-4 text-sm font-medium text-zinc-300">No activity found</h3>
                <p className="mt-1 text-xs text-zinc-500">Try adjusting your filters</p>
              </div>
            )}

            {hasMore && (
              <div className="p-4 border-t border-zinc-800/80">
                <button
                  onClick={() => fetchLogs(true)}
                  disabled={loadingMore}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-xs font-semibold text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load more activity"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
