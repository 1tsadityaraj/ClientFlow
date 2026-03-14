import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
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
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <p>Please sign in.</p>
      </main>
    );
  }

  const where = { orgId: session.user.orgId };
  if (session.user.role === "client") {
    where.clientUserId = session.user.id;
  }

  const [projects, members, tasks, recentComments, org] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tasks: true, files: true, comments: true } },
        manager: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { orgId: session.user.orgId },
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.task.findMany({
      where: { orgId: session.user.orgId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.comment.findMany({
      where: { orgId: session.user.orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        project: { select: { name: true } },
      },
    }),
    prisma.org.findFirst({ where: { id: session.user.orgId } }),
  ]);

  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter(
    (p) => p.status === "completed"
  ).length;
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

  const statusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "completed":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "on_hold":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
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
        return "text-zinc-400";
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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Sidebar + Content Layout */}
      <div className="flex">
        {/* Sidebar */}
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
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              active
            />
            <SidebarLink
              href="/dashboard/members"
              icon={<Users className="h-4 w-4" />}
              label="Members"
            />
            <SidebarLink
              href="/dashboard/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
            />

            <div className="pt-4">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Projects
              </p>
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-zinc-200"
                >
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="border-t border-zinc-800/80 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold">
                {(session.user.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-200">
                  {session.user.name}
                </p>
                <p className="truncate text-[10px] text-zinc-500">
                  {session.user.role}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-6 py-4 backdrop-blur-xl lg:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Overview
              </p>
              <h1 className="text-xl font-semibold tracking-tight">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/members"
                className="flex items-center gap-2 rounded-full border border-zinc-700/80 px-4 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white lg:hidden"
              >
                <Users className="h-3.5 w-3.5" />
                Members
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 rounded-full border border-zinc-700/80 px-4 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white lg:hidden"
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
                label="Active Projects"
                value={activeCount}
                detail={`${completedCount} completed`}
                gradient="from-brand-primary/20 to-brand-primary/5"
                iconColor="text-brand-primary"
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Tasks Done"
                value={doneTasks}
                detail={`${totalTasks} total`}
                gradient="from-emerald-500/20 to-teal-500/20"
                iconColor="text-emerald-400"
              />
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Team Members"
                value={members.length}
                detail={`${clientCount} clients`}
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
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-brand-primary" />
                  Task Progress Overview
                </h3>
                <span className="text-xs text-zinc-500">
                  {totalTasks} total tasks
                </span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-zinc-800">
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
                  <span className="text-zinc-400">
                    Done ({doneTasks})
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-zinc-400">
                    In Progress ({inProgressTasks})
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-500" />
                  <span className="text-zinc-400">
                    To Do ({todoTasks})
                  </span>
                </span>
              </div>
            </section>

            {/* Two Column Section */}
            <div className="grid gap-6 xl:grid-cols-3">
              {/* Projects Grid */}
              <section className="space-y-4 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                    <FolderKanban className="h-4 w-4 text-brand-primary" />
                    Projects
                  </h2>
                  <span className="text-xs text-zinc-500">
                    {projects.length} total
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-black/20"
                    >
                      {/* Color accent */}
                      <div
                        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                        style={{ backgroundColor: project.color }}
                      />

                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 pl-2">
                          <h3 className="text-sm font-semibold text-zinc-50 group-hover:text-white">
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
                        <p className="mt-2 line-clamp-2 pl-2 text-xs leading-relaxed text-zinc-400">
                          {project.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="mt-4 pl-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-zinc-500">
                            Progress
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-300">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${project.progress}%`,
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
                          {project._count.comments} comments
                        </span>
                      </div>

                      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <ArrowRight className="h-4 w-4 text-zinc-400" />
                      </div>
                    </Link>
                  ))}

                  {projects.length === 0 && (
                    <div className="col-span-2 rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
                      <FolderKanban className="mx-auto h-8 w-8 text-zinc-600" />
                      <p className="mt-2 text-sm text-zinc-400">
                        No projects yet
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Create your first project to get started
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Upcoming Deadlines */}
                <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-4">
                    <Clock className="h-4 w-4 text-amber-400" />
                    Upcoming Deadlines
                  </h3>
                  <ul className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-start gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3 transition-colors hover:bg-zinc-800/40"
                      >
                        <span
                          className={`mt-0.5 text-lg leading-none ${priorityColor(
                            task.priority
                          )}`}
                        >
                          •
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-zinc-200">
                            {task.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-400">
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

                {/* Recent Activity */}
                <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-4">
                    <MessageSquare className="h-4 w-4 text-violet-400" />
                    Recent Activity
                  </h3>
                  <ul className="space-y-3">
                    {recentComments.map((c) => (
                      <li
                        key={c.id}
                        className="flex gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3 transition-colors hover:bg-zinc-800/40"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-[10px] font-bold text-violet-300">
                          {(c.user?.name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-zinc-500">
                            <span className="font-medium text-zinc-300">
                              {c.user?.name}
                            </span>{" "}
                            on{" "}
                            <span className="text-zinc-400">
                              {c.project?.name}
                            </span>
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">
                            {c.body}
                          </p>
                        </div>
                      </li>
                    ))}
                    {recentComments.length === 0 && (
                      <li className="py-4 text-center text-xs text-zinc-500">
                        No recent activity
                      </li>
                    )}
                  </ul>
                </section>

                {/* Team Members Quick View */}
                <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
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
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-800/40"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-blue-500/30 text-[10px] font-bold text-sky-300">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-zinc-200">
                            {m.name}
                          </p>
                          <p className="truncate text-[10px] text-zinc-500">
                            {m.email}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-400">
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

function SidebarLink({ href, icon, label, active = false }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-brand-primary/10 text-brand-primary"
          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function StatCard({ icon, label, value, detail, gradient, iconColor }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br ${gradient} p-5 transition-all hover:border-zinc-700`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
            {value}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{detail}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
