import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import { PERMISSIONS } from "../../../lib/permissions.js";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  Activity,
  Zap,
  Home,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import CreateProjectButton from "./CreateProjectButton";
import Sidebar from "@/components/Sidebar";
import DashboardActivityFeed from "./DashboardActivityFeed";
import Breadcrumb from "@/components/Breadcrumb";
import TeamProgressSection from "@/components/TeamProgressSection";
import MyStatusWidget from "@/components/MyStatusWidget";
import MyTasksWidget from "@/components/MyTasksWidget";
import { Shield } from "@/components/Shield";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">
        <p>Please sign in.</p>
      </main>
    );
  }

  const orgId = session.user.orgId;
  const where = { orgId };
  if (session.user.role === "client") {
    where.clientUserId = session.user.id;
  }

  let projects, members, tasks, org, totalProjects, activeCount, activeTasksCount;

  try {
    [projects, members, tasks, org, totalProjects, activeCount, activeTasksCount] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { tasks: true, files: true, comments: true } },
          manager: { select: { name: true } },
          tasks: { select: { status: true } },
        },
      }),
      prisma.user.findMany({
        where: { orgId: session.user.orgId },
        select: { id: true, name: true, email: true, role: true },
      }),
      prisma.task.findMany({
        where: { orgId: session.user.orgId },
        orderBy: { createdAt: "desc" },
        include: {
          assignee: { select: { id: true, name: true } },
        },
      }),
      prisma.org.findFirst({ where: { id: session.user.orgId } }),
      prisma.project.count({
        where: { orgId },
      }),
      prisma.project.count({
        where: { orgId, status: "active" },
      }),
      prisma.task.count({
        where: {
          orgId,
          status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] }
        },
      })
    ]);
  } catch (error) {
    console.error("[Dashboard] Database connection error:", error);
    return (
      <main className="flex min-h-screen items-center justify-center p-6" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <div className="rounded-3xl border p-12 text-center max-w-lg shadow-xl" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 mb-6">
            <Zap className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">Connecting to Database...</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
            Our serverless database might be waking up from a cold start. This usually takes 3-5 seconds. Please try again.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90"
            style={{ background: "var(--accent)", boxShadow: "var(--shadow-md)" }}
          >
            Try again
          </a>
        </div>
      </main>
    );
  }

  // Team Size
  const teamSize = members.length;
  const clientCount = members.filter((m) => m.role === "client").length;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const todoTasks = tasks.filter((t) => t.status === "TODO").length;
  const completionRate =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Upcoming deadlines
  const now = new Date();
  const upcomingTasks = tasks
    .filter((t) => t.dueDate && new Date(t.dueDate) > now && t.status !== "DONE")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Member workload data
  const memberWorkload = members
    .filter((m) => m.role !== "client")
    .map((m) => {
      const memberTasks = tasks.filter((t) => t.assignee?.id === m.id);
      const done = memberTasks.filter((t) => t.status === "DONE").length;
      const inProgress = memberTasks.filter(
        (t) => t.status === "IN_PROGRESS"
      ).length;
      const todo = memberTasks.filter((t) => t.status === "TODO").length;
      const total = memberTasks.length;
      return { ...m, done, inProgress, todo, total };
    });

  // Client members for project creation
  const clientMembers = members.filter((m) => m.role === "client");

  const statusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "completed":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "on_hold":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 border-zinc-500/30";
    }
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "text-rose-400";
      case "MEDIUM":
        return "text-amber-400";
      case "LOW":
        return "text-emerald-400";
      default:
        return "text-zinc-600 dark:text-zinc-600 dark:text-zinc-400";
    }
  };

  const daysUntil = (date) => {
    const diff = Math.ceil(
      (new Date(date) - now) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} days`;
  };

  console.log("[DASHBOARD] User Role:", session.user.role);
  const canCreateProject = PERMISSIONS[session.user.role]?.createProject;
  const canSendMessage = PERMISSIONS[session.user.role]?.sendMessage;
  console.log("[DASHBOARD] canCreateProject:", canCreateProject, "canSendMessage:", canSendMessage);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Sidebar + Content Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar org={org} session={session} projects={projects} />

        <div style={{ flex: 1, overflow: "auto" }}>
          <Breadcrumb />
          {/* Top Bar */}
          <header style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", background: "var(--bg-primary)", padding: "16px 32px" }}>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
              </p>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
                Dashboard
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {canCreateProject && (
                <CreateProjectButton clientMembers={clientMembers} />
              )}
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700/80 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300 transition-all hover:border-brand-primary/50 hover:bg-brand-primary/10 hover:text-brand-primary"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Team Chat
              </Link>
              <Shield blockRoles={["client"]}>
                <Link
                  href="/dashboard/members"
                  className="flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700/80 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/50 hover:text-white lg:hidden"
                >
                  <Users className="h-3.5 w-3.5" />
                  Members
                </Link>
              </Shield>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700/80 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/50 hover:text-white lg:hidden"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
            </div>
          </header>

          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Stats Grid */}
            <section style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <StatCard
                icon={<FolderKanban className="h-5 w-5" />}
                label="Total Projects"
                value={totalProjects}
                detail={`${activeCount} active`}
                gradient="from-brand-primary/20 to-brand-primary/5"
                iconColor="text-brand-primary"
              />
              <StatCard
                icon={<Activity className="h-5 w-5" />}
                label="Active Tasks"
                value={activeTasksCount}
                detail="Across workspace"
                gradient="from-amber-500/20 to-orange-500/20"
                iconColor="text-amber-400"
              />
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Team Size"
                value={teamSize}
                detail="Workspace members"
                gradient="from-sky-500/20 to-blue-500/20"
                iconColor="text-sky-400"
              />
              <StatCard
                icon={<TrendingUp size={20} />}
                label="Completion Rate"
                value={`${completionRate}%`}
                detail={`${inProgressTasks} in progress`}
                gradient="none"
                iconColor="var(--warning)"
              />
            </section>

            {/* Task Progress Bar */}
            <section style={{ padding: "24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={16} color="var(--accent)" />
                  Task Progress Overview
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {totalTasks} total tasks
                </span>
              </div>
              <div style={{ display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden", background: "var(--bg-secondary)" }}>
                {doneTasks > 0 && (
                  <div
                    style={{
                      height: "100%", transition: "width 0.5s", background: "var(--success)",
                      width: `${(doneTasks / totalTasks) * 100}%`,
                    }}
                  />
                )}
                {inProgressTasks > 0 && (
                  <div
                    style={{
                      height: "100%", transition: "width 0.5s", background: "var(--warning)",
                      width: `${(inProgressTasks / totalTasks) * 100}%`,
                    }}
                  />
                )}
                {todoTasks > 0 && (
                  <div
                    style={{
                      height: "100%", transition: "width 0.5s", background: "var(--text-dim)",
                      width: `${(todoTasks / totalTasks) * 100}%`,
                    }}
                  />
                )}
              </div>
              <div className="mt-3 flex gap-6 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                    Done ({doneTasks})
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                    In Progress ({inProgressTasks})
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-500" />
                  <span className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                    To Do ({todoTasks})
                  </span>
                </span>
              </div>
            </section>

            {/* Team Member Workload — Enhanced */}
            <TeamProgressSection orgId={session.user.orgId} />

            {/* Two Column Section */}
            <div className="grid gap-6 xl:grid-cols-3">
              {/* Projects Grid */}
              <section className="space-y-4 xl:col-span-2">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    <FolderKanban size={20} color="var(--accent)" />
                    Projects
                  </h2>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {projects.length} total
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {projects.map((project) => {
                      const totalProjectTasks = project.tasks?.length || 0;
                      const doneProjectTasks = project.tasks?.filter((t) => t.status === "DONE").length || 0;
                      const calculatedProgress = totalProjectTasks > 0 ? Math.round((doneProjectTasks / totalProjectTasks) * 100) : 0;

                      return (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      style={{
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                        height: "160px", padding: "20px", background: "var(--surface)",
                        border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                        textDecoration: "none", transition: "all 0.2s",
                        boxShadow: "var(--shadow-sm)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        e.currentTarget.style.borderColor = "var(--border-light)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyItems: "space-between", gap: "12px" }}>
                          <span style={{ height: "10px", width: "10px", borderRadius: "50%", backgroundColor: project.color, flexShrink: 0, marginTop: "4px" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {project.name}
                            </h3>
                            <p style={{ marginTop: "2px", fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              Managed by {project.manager?.name || "—"}
                            </p>
                          </div>
                          <span
                            style={{
                              flexShrink: 0, display: "inline-flex", borderRadius: "99px", padding: "2px 8px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                              ...(project.status === 'active' ? { background: "var(--success-light)", color: "var(--success)" } :
                                  project.status === 'completed' ? { background: "var(--info-light)", color: "var(--info)" } :
                                  project.status === 'on_hold' ? { background: "var(--warning-light)", color: "var(--warning)" } :
                                  { background: "var(--bg-secondary)", color: "var(--text-muted)" })
                            }}
                          >
                            {project.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        {/* Progress bar */}
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Progress</span>
                            <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-primary)" }}>{calculatedProgress}%</span>
                          </div>
                          <div style={{ height: "4px", borderRadius: "2px", background: "var(--bg-secondary)", overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: "2px", transition: "width 0.5s", backgroundColor: project.color, width: `${calculatedProgress}%` }} />
                          </div>
                        </div>

                        {/* Counts */}
                        <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "var(--text-muted)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={12} /> {project._count.tasks} tasks
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <MessageSquare size={12} /> {project._count.comments} discussions
                          </span>
                        </div>
                      </div>
                    </Link>
                  )})}

                  {projects.length === 0 && (
                    <div className="col-span-2 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 p-8 text-center">
                      <FolderKanban className="mx-auto h-8 w-8 text-zinc-600" />
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 font-medium">
                        No projects found
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 mb-4">
                        Add your first project to get started
                      </p>
                      {canCreateProject && (
                        <div className="flex justify-center">
                          <CreateProjectButton clientMembers={clientMembers} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Right Column */}
              <div className="space-y-6">
                {/* My Status Widget */}
                <MyStatusWidget />

                {/* My Tasks Widget */}
                <MyTasksWidget />

                {/* Upcoming Deadlines */}
                <section style={{ padding: "24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                    <Clock size={16} color="var(--warning)" />
                    Upcoming Deadlines
                  </h3>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none", padding: 0 }}>
                    {upcomingTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/30 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/40"
                      >
                        <span
                          className={`mt-0.5 text-lg leading-none ${priorityColor(
                            task.priority
                          )}`}
                        >
                          •
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            {task.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                              {task.priority}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {daysUntil(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                    {upcomingTasks.length === 0 && (
                      <li className="py-4 text-center text-xs text-zinc-500">
                        No upcoming deadlines 🎉
                      </li>
                    )}
                  </ul>
                </section>

                {/* Recent Activity Feed */}
                <DashboardActivityFeed />

                {/* Team Members Quick View */}
                <section style={{ padding: "24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                      <Users size={16} color="var(--info)" />
                      Team
                    </h3>
                    <Link
                      href="/dashboard/members"
                      style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {members.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/40"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-blue-500/30 text-[10px] font-bold text-sky-300">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            {m.name}
                          </p>
                          <p className="truncate text-[10px] text-zinc-500">
                            {m.email}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


function StatCard({ icon, label, value, detail, iconColor }) {
  return (
    <div
      style={{
        height: "120px",
        padding: "24px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-light)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
            {label}
          </p>
          <p style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
            {value}
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{detail}</p>
        </div>
        <div
          style={{
            display: "flex", height: "40px", width: "40px", alignItems: "center", justifyContent: "center",
            borderRadius: "12px", background: "var(--bg-secondary)", color: iconColor
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
