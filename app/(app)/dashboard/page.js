import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import Link from "next/link";

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

  const [projects, members] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.user.findMany({
      where: { orgId: session.user.orgId },
    }),
  ]);

  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const clientCount = members.filter((m) => m.role === "client").length;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">Workspace</p>
            <h1 className="text-lg font-semibold">
              {session.user.orgName || "Dashboard"}
            </h1>
          </div>
          <div className="flex gap-3 text-xs text-zinc-400">
            <Link href="/dashboard/members">Members</Link>
            <Link href="/dashboard/settings">Settings</Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Active projects" value={activeCount} />
          <StatCard label="Completed" value={completedCount} />
          <StatCard label="Team size" value={members.length} />
          <StatCard label="Clients" value={clientCount} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-200">
              Projects
            </h2>
            <Link
              href="#"
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm hover:border-zinc-600"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-50">
                    {project.name}
                  </p>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-400">
                    {project.description}
                  </p>
                )}
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-400">
                No projects yet. Once you create a project it will appear here.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-zinc-50">{value}</p>
    </div>
  );
}

