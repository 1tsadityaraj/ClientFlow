import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const session = await auth();
  const seedSecret = request.headers.get("x-seed-secret");

  if (session?.user?.role !== "admin" || seedSecret !== process.env.SEED_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  try {
    // Clean up existing data
    await prisma.activityLog.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.file.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.invite.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.org.deleteMany({});

    // 1. Create Orgs
    const pixelAgency = await prisma.org.create({
      data: { name: "Pixel Agency", slug: "pixel", plan: "pro" },
    });

    const novaStudio = await prisma.org.create({
      data: { name: "Nova Studio", slug: "nova", plan: "starter" },
    });

    // 2. Create Users for Pixel Agency
    const alice = await prisma.user.create({
      data: { name: "Alice Johnson", email: "alice@pixel.co", hashedPassword, role: "admin", orgId: pixelAgency.id },
    });
    const bob = await prisma.user.create({
      data: { name: "Bob Martinez", email: "bob@pixel.co", hashedPassword, role: "manager", orgId: pixelAgency.id },
    });
    const carol = await prisma.user.create({
      data: { name: "Carol Chen", email: "carol@pixel.co", hashedPassword, role: "member", orgId: pixelAgency.id },
    });
    const emma = await prisma.user.create({
      data: { name: "Emma Davis", email: "emma@pixel.co", hashedPassword, role: "member", orgId: pixelAgency.id },
    });
    const dave = await prisma.user.create({
      data: { name: "Dave Wilson", email: "dave@client.com", hashedPassword, role: "client", orgId: pixelAgency.id },
    });
    const sarah = await prisma.user.create({
      data: { name: "Sarah Miller", email: "sarah@client.com", hashedPassword, role: "client", orgId: pixelAgency.id },
    });

    // Nova Studio Users
    const novaAdmin = await prisma.user.create({
      data: { name: "Nova Admin", email: "admin@nova.io", hashedPassword, role: "admin", orgId: novaStudio.id },
    });

    // 3. Projects for Pixel Agency
    const projectData = [
      { name: "Acme Website Redesign", progress: 90, color: "#6366f1", client: dave, manager: bob },
      { name: "Global Logistics Portal", progress: 65, color: "#10b981", client: sarah, manager: alice },
      { name: "Brand Guidelines v2", progress: 100, color: "#f59e0b", client: dave, manager: bob },
      { name: "Mobile App MVP", progress: 35, color: "#ec4899", client: sarah, manager: alice },
      { name: "SEO Audit & Strategy", progress: 10, color: "#06b6d4", client: dave, manager: alice },
    ];

    const projects = [];
    for (const p of projectData) {
      const project = await prisma.project.create({
        data: {
          orgId: pixelAgency.id,
          name: p.name,
          progress: p.progress,
          color: p.color,
          status: p.progress === 100 ? "completed" : "active",
          managerId: p.manager.id,
          clientUserId: p.client.id,
          description: `High-priority project for ${p.client.name}. Focus on ${p.name.toLowerCase()}.`,
        },
      });
      projects.push(project);

      // Create tasks
      const taskTitles = ["Research & Discovery", "Initial Concepts", "Development Phase 1", "Client Review", "Final Polishing"];
      for (let i = 0; i < taskTitles.length; i++) {
        await prisma.task.create({
          data: {
            orgId: pixelAgency.id,
            projectId: project.id,
            title: taskTitles[i],
            status: i < (p.progress / 20) ? "DONE" : i === Math.floor(p.progress / 20) ? "IN_PROGRESS" : "TODO",
            priority: i === 0 ? "HIGH" : "MEDIUM",
            dueDate: new Date(Date.now() + (i - 2) * 86400000 * 3),
            assigneeId: [alice.id, bob.id, carol.id, emma.id][i % 4],
          }
        });
      }

      // Create comments
      const commentBodies = [
        "Just uploaded the latest assets. Please take a look @manager.",
        "The client provided feedback on the initial mockups. We need to tweak the hero section.",
        "Excellent progress team! Let's keep the momentum going for the next milestone."
      ];
      for (const body of commentBodies) {
        await prisma.comment.create({
          data: {
            orgId: pixelAgency.id,
            projectId: project.id,
            userId: [alice.id, bob.id, carol.id][Math.floor(Math.random() * 3)],
            body,
          }
        });
      }
    }

    // 4. Activity Logs
    const activityActions = [
      { action: 'project_created', type: 'project', userId: alice.id, project: projects[0] },
      { action: 'task_created', type: 'task', userId: bob.id, project: projects[0], name: "Design mockups" },
      { action: 'task_completed', type: 'task', userId: carol.id, project: projects[0], name: "Research & Discovery" },
      { action: 'comment_added', type: 'comment', userId: dave.id, project: projects[0], name: projects[0].name },
      { action: 'file_uploaded', type: 'file', userId: alice.id, project: projects[0], name: "Styleguide.pdf" },
      { action: 'project_updated', type: 'project', userId: bob.id, project: projects[1] },
      { action: 'task_created', type: 'task', userId: emma.id, project: projects[1], name: "API Integration" },
      { action: 'task_assigned', type: 'task', userId: alice.id, project: projects[1], name: "API Integration" },
      { action: 'comment_added', type: 'comment', userId: sarah.id, project: projects[1], name: projects[1].name },
      { action: 'member_invited', type: 'member', userId: alice.id, name: "new-hire@pixel.co" },
      { action: 'project_completed', type: 'project', userId: bob.id, project: projects[2] },
      { action: 'task_completed', type: 'task', userId: carol.id, project: projects[0], name: "Initial Concepts" },
      { action: 'comment_added', type: 'comment', userId: emma.id, project: projects[3], name: projects[3].name },
      { action: 'file_uploaded', type: 'file', userId: alice.id, project: projects[3], name: "AppAssets.zip" },
      { action: 'task_created', type: 'task', userId: bob.id, project: projects[4], name: "SEO Audit" },
      { action: 'role_changed', type: 'member', userId: alice.id, name: carol.name, metadata: { oldRole: 'member', newRole: 'manager' } },
    ];

    for (let i = 0; i < activityActions.length; i++) {
      const act = activityActions[i];
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - (activityActions.length - i) * 1.5);

      await prisma.activityLog.create({
        data: {
          orgId: pixelAgency.id,
          projectId: act.project?.id || null,
          userId: act.userId,
          action: act.action,
          entityType: act.type,
          entityId: act.project?.id || 'demo-id',
          entityName: act.name || act.project?.name || "Demo Item",
          metadata: act.metadata ? JSON.stringify(act.metadata) : null,
          createdAt,
        }
      });
    }

    return Response.json({ 
      success: true, 
      created: { 
        orgs: 2, 
        users: 7, 
        projects: projects.length 
      } 
    });
  } catch (err) {
    console.error("Seed API error:", err);
    return Response.json({ error: "Seed failed", details: err.message }, { status: 500 });
  }
}
