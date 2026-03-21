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
import { Shield } from "./Shield";

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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col transition-transform duration-250 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: "240px",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", height: "36px", width: "36px", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", background: "var(--accent)", fontSize: "12px", fontWeight: "bold", color: "white", boxShadow: "var(--shadow-md)" }}>
            CF
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {org?.name || "ClientFlow"}
            </p>
            <p style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
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
            <Shield blockRoles={["client"]}>
              <SidebarLink
                href="/dashboard/members"
                icon={<Users className="h-4 w-4" />}
                label="Members"
              />
            </Shield>
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
              <div style={{ paddingTop: "16px" }}>
                <p style={{ marginBottom: "8px", padding: "0 12px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)" }}>
                  PROJECTS
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        textDecoration: "none",
                        borderRadius: "var(--radius-md)",
                        transition: "all 0.15s",
                        background: pathname.includes(project.id) ? "var(--accent-light)" : "transparent",
                        color: pathname.includes(project.id) ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                    >
                      <span
                        style={{
                          height: "8px",
                          width: "8px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          backgroundColor: project.color || "var(--accent)"
                        }}
                      />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</span>
                    </Link>
                  ))}
                  {projects.length > 5 && (
                    <Link
                      href="/dashboard"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        textDecoration: "none",
                        color: "var(--accent)",
                        borderRadius: "var(--radius-md)",
                        transition: "all 0.15s",
                      }}
                    >
                      View all
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex", height: "32px", width: "32px", alignItems: "center", justifyContent: "center",
                borderRadius: "50%", background: "var(--accent)", fontSize: "12px", fontWeight: "bold", color: "white"
              }}
            >
              {(session?.user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>
                {session?.user?.name}
              </p>
              <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "10px", color: "var(--text-muted)", textTransform: "capitalize" }}>
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
        background: active ? "var(--accent-light)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
        transition: "all 0.15s",
        marginBottom: "4px",
        borderRadius: "0 var(--radius-md) var(--radius-md) 0",
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
            background: "var(--danger)",
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
