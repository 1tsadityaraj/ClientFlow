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

  const where = { orgId: session.user.orgId };
  if (session.user.role === "client") {
    where.clientUserId = session.user.id;
  }

  const [projects, members, tasks, org] = await Promise.all([
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
  ]);

  const orgId = session.user.orgId;

  // --- Dashboard Intelligence Stats ---
  // Total Projects
  const totalProjects = await prisma.project.count({
    where: { orgId },
  });
  const activeCount = await prisma.project.count({
    where: { orgId, status: "active" },
  });

  // Active Tasks
  const activeTasksCount = await prisma.task.count({
    where: {
      orgId,
      status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] }
    },
  });

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
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">
      {/* Sidebar + Content Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar org={org} session={session} projects={projects} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Breadcrumb />
          {/* Top Bar */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/80 px-6 py-4 backdrop-blur-xl lg:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Overview
              </p>
              <h1 className="text-xl font-semibold tracking-tight">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
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

          <div className="mx-auto max-w-7xl space-y-6 px-6 py-6 lg:px-8">
            {/* Stats Grid */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                icon={<TrendingUp className="h-5 w-5" />}
                label="Completion Rate"
                value={`${completionRate}%`}
                detail={`${inProgressTasks} in progress`}
                gradient="from-amber-500/20 to-orange-500/20"
                iconColor="text-amber-400"
              />
            </section>

            {/* Task Progress Bar */}
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-brand-primary" />
                  Task Progress Overview
                </h3>
                <span className="text-xs text-zinc-500">
                  {totalTasks} total tasks
                </span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                {doneTasks > 0 && (
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${(doneTasks / totalTasks) * 100}%`,
                    }}
                  />
                )}
                {inProgressTasks > 0 && (
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                    style={{
                      width: `${(inProgressTasks / totalTasks) * 100}%`,
                    }}
                  />
                )}
                {todoTasks > 0 && (
                  <div
                    className="bg-gradient-to-r from-zinc-600 to-zinc-500 transition-all duration-500"
                    style={{
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
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    <FolderKanban className="h-4 w-4 text-brand-primary" />
                    Projects
                  </h2>
                  <span className="text-xs text-zinc-500">
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
                      className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5 transition-all duration-300 hover:border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50/90 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/60 hover:shadow-lg hover:shadow-black/20"
                    >
                      {/* Color accent */}
                      <div
                        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                        style={{ backgroundColor: project.color }}
                      />

                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 pl-2">
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 group-hover:text-white">
                            {project.name}
                          </h3>
                          <p className="mt-0.5 text-[10px] text-zinc-500">
                            Managed by{" "}
                            {project.manager?.name || "—"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>

                      {project.description && (
                        <p className="mt-2 line-clamp-2 pl-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                          {project.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="mt-4 pl-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-zinc-500">
                            Progress
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                            {calculatedProgress}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${calculatedProgress}%`,
                              backgroundColor: project.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Counts */}
                      <div className="mt-3 flex gap-4 pl-2 text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {project._count.tasks} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {project._count.comments} discussions
                        </span>
                      </div>

                      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <ArrowRight className="h-4 w-4 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400" />
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
                <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
                    <Clock className="h-4 w-4 text-amber-400" />
                    Upcoming Deadlines
                  </h3>
                  <ul className="space-y-3">
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
                <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      <Users className="h-4 w-4 text-sky-400" />
                      Team
                    </h3>
                    <Link
                      href="/dashboard/members"
                      className="text-[10px] font-medium text-brand-primary hover:text-brand-primary/80"
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


function StatCard({ icon, label, value, detail, gradient, iconColor }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-gradient-to-br ${gradient} p-5 transition-all hover:border-zinc-300 dark:border-zinc-300 dark:border-zinc-700`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{detail}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50/90 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/60 ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
