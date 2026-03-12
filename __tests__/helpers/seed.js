import { prisma } from "../../lib/prisma.js";

const ROLES = { ADMIN: "admin" };

/**
 * Creates two tenants: org_a (adminA, projectA) and org_b (adminB, projectB).
 * @returns {Promise<{ orgA: any, orgB: any, adminA: any, adminB: any, projectA: any, projectB: any }>}
 */
export async function seedTwoTenants() {
  const orgA = await prisma.org.create({
    data: { name: "Org A", slug: "org-a", plan: "starter" },
  });
  const orgB = await prisma.org.create({
    data: { name: "Org B", slug: "org-b", plan: "starter" },
  });

  const adminA = await prisma.user.create({
    data: {
      name: "Admin A",
      email: "admin-a@example.com",
      hashedPassword: "hash",
      orgId: orgA.id,
      role: ROLES.ADMIN,
    },
  });
  const adminB = await prisma.user.create({
    data: {
      name: "Admin B",
      email: "admin-b@example.com",
      hashedPassword: "hash",
      orgId: orgB.id,
      role: ROLES.ADMIN,
    },
  });

  const projectA = await prisma.project.create({
    data: {
      orgId: orgA.id,
      name: "Project A",
      managerId: adminA.id,
    },
  });
  const projectB = await prisma.project.create({
    data: {
      orgId: orgB.id,
      name: "Project B",
      managerId: adminB.id,
    },
  });

  return { orgA, orgB, adminA, adminB, projectA, projectB };
}

/**
 * Deletes all entities created by seedTwoTenants (by ids).
 * @param {{ orgA: any, orgB: any, adminA: any, adminB: any, projectA: any, projectB: any }} ids
 */
export async function cleanTenants(ids) {
  if (!ids) return;
  const { orgA, orgB, adminA, adminB, projectA, projectB } = ids;
  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({
      where: { projectId: { in: [projectA.id, projectB.id] } },
    });
    await tx.file.deleteMany({
      where: { projectId: { in: [projectA.id, projectB.id] } },
    });
    await tx.task.deleteMany({
      where: { projectId: { in: [projectA.id, projectB.id] } },
    });
    await tx.project.deleteMany({
      where: { id: { in: [projectA.id, projectB.id] } },
    });
    await tx.invite.deleteMany({
      where: { orgId: { in: [orgA.id, orgB.id] } },
    });
    await tx.user.deleteMany({
      where: { id: { in: [adminA.id, adminB.id] } },
    });
    await tx.org.deleteMany({
      where: { id: { in: [orgA.id, orgB.id] } },
    });
  });
}
