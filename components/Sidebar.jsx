"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  Settings,
  Activity,
  ArrowRight,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";
import { ThemeToggle } from "./ThemeToggle";

export default function Sidebar({ org, session, projects: initialProjects = [] }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const orgId = session?.user?.orgId;
  const role = session?.user?.role;

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-mobile-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!initialProjects?.length && role !== "client") {
      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProjects(data);
        })
        .catch((err) => console.error("Failed to load projects inside sidebar:", err));
    } else if (initialProjects?.length) {
       setProjects(initialProjects);
    }
  }, [initialProjects, role]);

  // Unread badge logic
  useEffect(() => {
    if (!orgId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`org-${orgId}`);

    channel.bind("new-message", (data) => {
      if (pathname !== "/dashboard/chat") {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      pusher.unsubscribe(`org-${orgId}`);
    };
  }, [orgId, pathname]);

  // Clear unread when entering chat
  useEffect(() => {
    if (orgId && pathname === "/dashboard/chat") {
      localStorage.setItem(`chat_last_read_${orgId}`, new Date().toISOString());
      setUnreadCount(0);
    }
  }, [pathname, orgId]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-transform duration-250 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/80 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-xs font-bold text-white shadow-lg">
            CF
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">
              {org?.name || "ClientFlow"}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-brand-primary">
              {org?.plan || "starter"} plan
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-1 px-3 py-4">
            <SidebarLink
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
            />
            <SidebarLink
              href="/dashboard/members"
              icon={<Users className="h-4 w-4" />}
              label="Members"
            />
            {(role === "admin" || role === "manager") && (
              <SidebarLink
                href="/dashboard/activity"
                icon={<Activity className="h-4 w-4" />}
                label="Activity"
              />
            )}
            <SidebarLink
              href="/dashboard/chat"
              icon={<MessageCircle className="h-4 w-4" />}
              label="Team Chat"
              badge={unreadCount > 0 ? unreadCount : null}
            />
            <SidebarLink
              href="/dashboard/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
            />

            {role !== "client" && projects.length > 0 && (
              <div className="pt-4">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Projects
                </p>
                <div className="space-y-1">
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                        pathname.includes(project.id)
                          ? "bg-zinc-200 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200"
                          : "text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800/60 hover:text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color || "#6366f1" }}
                      />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  ))}
                  {projects.length > 5 && (
                    <Link
                      href="/dashboard"
                      className="group flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-brand-primary transition-all hover:bg-zinc-200 dark:bg-zinc-800/60 hover:text-brand-primary/80"
                    >
                      View all
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800/80 px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white shadow-lg"
            >
              {(session?.user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-200">
                {session?.user?.name}
              </p>
              <p className="truncate text-[10px] text-zinc-500 capitalize">
                {session?.user?.role}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ href, icon, label, badge = null }) {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const active = isActive(href);

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        fontSize: "14px",
        fontWeight: 500,
        textDecoration: "none",
        background: active ? "rgba(99,102,241,0.15)" : "transparent",
        color: active ? "#6366f1" : "#9090b0",
        borderLeft: active ? "2px solid #6366f1" : "2px solid transparent",
        transition: "all 0.15s",
        marginBottom: "4px",
        borderRadius: "0 8px 8px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {icon}
        {label}
      </div>
      {badge && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "16px",
            minWidth: "16px",
            borderRadius: "9999px",
            background: "#ef4444",
            color: "white",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
