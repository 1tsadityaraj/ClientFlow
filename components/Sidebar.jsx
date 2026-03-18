"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Users,
  MessageCircle,
  Settings,
  X,
  PlusCircle,
  Activity,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

export default function Sidebar({ org, session, projects = [] }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const orgId = session?.user?.orgId;

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
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950 lg:flex">
      <div className="flex items-center gap-3 border-b border-zinc-800/80 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-xs font-bold text-white shadow-lg">
          CF
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-50">
            {org?.name || "ClientFlow"}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-brand-primary">
            {org?.plan || "starter"} plan
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <SidebarLink
          href="/"
          icon={<Home className="h-4 w-4" />}
          label="Home"
          active={pathname === "/"}
        />
        <SidebarLink
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />
        <SidebarLink
          href="/dashboard/members"
          icon={<Users className="h-4 w-4" />}
          label="Members"
          active={pathname === "/dashboard/members"}
        />
        {(session?.user?.role === "admin" || session?.user?.role === "manager") && (
          <SidebarLink
            href="/dashboard/activity"
            icon={<Activity className="h-4 w-4" />}
            label="Activity"
            active={pathname === "/dashboard/activity"}
          />
        )}
        <SidebarLink
          href="/dashboard/chat"
          icon={<MessageCircle className="h-4 w-4" />}
          label="Team Chat"
          active={pathname === "/dashboard/chat"}
          badge={unreadCount > 0 ? unreadCount : null}
        />
        <SidebarLink
          href="/dashboard/settings"
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={pathname === "/dashboard/settings"}
        />

        {projects.length > 0 && (
          <div className="pt-4">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Projects
            </p>
            <div className="space-y-1">
              {projects.slice(0, 8).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                    pathname.includes(project.id)
                      ? "bg-zinc-800/50 text-zinc-200"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-zinc-800/80 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white shadow-lg`}>
            {(session?.user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-200">
              {session?.user?.name}
            </p>
            <p className="truncate text-[10px] text-zinc-500 capitalize">
              {session?.user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label, active = false, badge = null }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-brand-primary/10 text-brand-primary"
          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {badge && (
        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
