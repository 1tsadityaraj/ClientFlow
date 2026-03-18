const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting idempotent seed process...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Upsert Orgs
  const pixelAgency = await prisma.org.upsert({
    where: { slug: "pixel" },
    update: {},
    create: {
      name: "Pixel Agency",
      slug: "pixel",
      plan: "pro",
    },
  });
  console.log("✅ Created/Verified org: Pixel Agency");

  const novaStudio = await prisma.org.upsert({
    where: { slug: "nova" },
    update: {},
    create: {
      name: "Nova Studio",
      slug: "nova",
      plan: "starter",
    },
  });
  console.log("✅ Created/Verified org: Nova Studio");

  // 2. Upsert Users for Pixel Agency
  const alice = await prisma.user.upsert({
    where: { email: "alice@pixel.co" },
    update: {},
    create: { 
      name: "Alice Johnson", 
      email: "alice@pixel.co", 
      hashedPassword, 
      role: "admin", 
      orgId: pixelAgency.id,
      avatar: "AJ"
    },
  });
  console.log("✅ Created/Verified user: alice@pixel.co (admin)");

  const bob = await prisma.user.upsert({
    where: { email: "bob@pixel.co" },
    update: {},
    create: { 
      name: "Bob Martinez", 
      email: "bob@pixel.co", 
      hashedPassword, 
      role: "manager", 
      orgId: pixelAgency.id,
      avatar: "BM"
    },
  });
  const carol = await prisma.user.upsert({
    where: { email: "carol@pixel.co" },
    update: {},
    create: { 
      name: "Carol Chen", 
      email: "carol@pixel.co", 
      hashedPassword, 
      role: "member", 
      orgId: pixelAgency.id,
      avatar: "CC"
    },
  });
  const emma = await prisma.user.upsert({
    where: { email: "emma@pixel.co" },
    update: {},
    create: { 
      name: "Emma Davis", 
      email: "emma@pixel.co", 
      hashedPassword, 
      role: "member", 
      orgId: pixelAgency.id,
      avatar: "ED"
    },
  });
  const dave = await prisma.user.upsert({
    where: { email: "dave@client.com" },
    update: {},
    create: { 
      name: "Dave Wilson", 
      email: "dave@client.com", 
      hashedPassword, 
      role: "client", 
      orgId: pixelAgency.id,
      avatar: "DW"
    },
  });
  const sarah = await prisma.user.upsert({
    where: { email: "sarah@client.com" },
    update: {},
    create: { 
      name: "Sarah Miller", 
      email: "sarah@client.com", 
      hashedPassword, 
      role: "client", 
      orgId: pixelAgency.id,
      avatar: "SM"
    },
  });

  // Nova Studio Users
  await prisma.user.upsert({
    where: { email: "admin@nova.io" },
    update: {},
    create: { 
      name: "Nova Admin", 
      email: "admin@nova.io", 
      hashedPassword, 
      role: "admin", 
      orgId: novaStudio.id,
      avatar: "NA"
    },
  });

  console.log("✅ Created/Verified all Users.");

  // 3. Projects for Pixel Agency
  const projectData = [
    { name: "Acme Website Redesign", progress: 90, color: "#6366f1", client: dave, manager: bob },
    { name: "Global Logistics Portal", progress: 65, color: "#10b981", client: sarah, manager: alice },
    { name: "Brand Guidelines v2", progress: 100, color: "#f59e0b", client: dave, manager: bob },
    { name: "Mobile App MVP", progress: 35, color: "#ec4899", client: sarah, manager: alice },
    { name: "SEO Audit & Strategy", progress: 10, color: "#06b6d4", client: dave, manager: alice },
  ];

  for (const p of projectData) {
    const project = await prisma.project.upsert({
      where: { 
        orgId_name: {
          orgId: pixelAgency.id,
          name: p.name
        }
      },
      update: {
        progress: p.progress,
        status: p.progress === 100 ? "completed" : "active",
      },
      create: {
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

    // Simple task creation for demo (not strictly idempotent but safe for re-runs by checking title)
    const taskTitles = ["Research & Discovery", "Initial Concepts", "Development Phase 1", "Client Review", "Final Polishing"];
    for (let i = 0; i < taskTitles.length; i++) {
        const existingTask = await prisma.task.findFirst({
            where: { projectId: project.id, title: taskTitles[i] }
        });
        
        if (!existingTask) {
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
    }
  }

  console.log("✅ Created/Verified Projects and Tasks.");

  // Activity Logs - Skip if many already exist to stay clean
  const count = await prisma.activityLog.count();
  if (count < 10) {
    console.log("🌱 Adding initial activity logs...");
    // Just a few sample logs
    await prisma.activityLog.create({
        data: {
            orgId: pixelAgency.id,
            userId: alice.id,
            action: 'project_created',
            entityType: 'project',
            entityName: "Acme Website Redesign",
            createdAt: new Date(Date.now() - 86400000 * 5)
        }
    });
  }

  console.log("✅ Seed process completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
