import { notFound } from "next/navigation";
import { auth } from "../../../../../lib/auth.js";
import { prisma } from "../../../../../lib/prisma.js";
import ProjectTabs from "./ProjectTabs";

export default async function ProjectDetailPage({ params }) {
  const session = await auth();

  if (!session) {
    notFound();
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      orgId: session.user.orgId,
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

  return (
    <ProjectTabs
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
      }}
    />
  );
}
