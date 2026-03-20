import { notFound } from "next/navigation";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import MemberDetailClient from "./MemberDetailClient";

export default async function MemberDetailPage({ params }) {
  const session = await auth();
  const { id } = await params;

  if (!session) notFound();

  const member = await prisma.user.findFirst({
    where: { id, orgId: session.user.orgId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      status: {
        select: { status: true, currentWork: true, updatedAt: true },
      },
    },
  });

  if (!member) notFound();

  // Get tasks assigned to this member
  const tasks = await prisma.task.findMany({
    where: { orgId: session.user.orgId, assigneeId: id },
    include: {
      project: { select: { id: true, name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get projects where this member is manager or has tasks
  const taskProjectIds = [...new Set(tasks.map((t) => t.projectId))];
  const managedProjects = await prisma.project.findMany({
    where: {
      orgId: session.user.orgId,
      OR: [{ managerId: id }, { id: { in: taskProjectIds } }],
    },
    include: {
      tasks: { select: { status: true } },
      manager: { select: { id: true, name: true } },
    },
  });

  const done = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const activeTasks = tasks.filter((t) => t.status !== "DONE").slice(0, 10);

  const projectsWithProgress = managedProjects.map((p) => {
    const pTotal = p.tasks.length;
    const pDone = p.tasks.filter((t) => t.status === "DONE").length;
    const progress = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
    const role = p.manager?.id === id ? "Manager" : "Member";
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      progress,
      role,
    };
  });

  return (
    <MemberDetailClient
      member={{
        ...member,
        createdAt: member.createdAt.toISOString(),
        status: member.status
          ? {
              ...member.status,
              updatedAt: member.status.updatedAt?.toISOString() || null,
            }
          : null,
      }}
      taskStats={{ total, done, inProgress, todo, completionRate }}
      activeTasks={activeTasks.map((t) => ({
        ...t,
        dueDate: t.dueDate?.toISOString() || null,
        createdAt: t.createdAt.toISOString(),
      }))}
      projects={projectsWithProgress}
    />
  );
}
