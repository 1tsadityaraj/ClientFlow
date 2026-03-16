import { notFound } from "next/navigation";
import { auth } from "../../../../../lib/auth.js";
import { prisma } from "../../../../../lib/prisma.js";
import ProjectTabs from "./ProjectTabs";

export default async function ProjectDetailPage({ params }) {
  const session = await auth();
  const { id } = await params;

  if (!session) {
    notFound();
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      orgId: session.user.orgId,
    },
    include: {
      manager: { select: { id: true, name: true, email: true } },
      clientUser: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, comments: true, files: true } },
    },
  });

  if (!project) {
    notFound();
  }

  if (
    session.user.role === "client" &&
    project.clientUserId !== session.user.id
  ) {
    notFound();
  }

  // Compute dynamic progress: (DONE tasks / Total tasks) * 100
  const tasks = await prisma.task.findMany({
    where: { projectId: project.id, orgId: session.user.orgId },
    select: { status: true },
  });
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const dynamicProgress =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <ProjectTabs
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        color: project.color,
        progress: dynamicProgress,
        manager: project.manager,
        clientUser: project.clientUser,
        _count: project._count,
        totalTasks,
        doneTasks,
      }}
      userRole={session.user.role}
    />
  );
}
