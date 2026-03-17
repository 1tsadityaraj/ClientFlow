const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting RICH seed process...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Clean up existing data
  await prisma.auditLog.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.file.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.invite.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.org.deleteMany({});

  console.log("Deleted existing records.");

  // 1. Create Orgs
  const pixelAgency = await prisma.org.create({
    data: {
      name: "Pixel Agency",
      slug: "pixel",
      plan: "pro",
    },
  });

  const novaStudio = await prisma.org.create({
    data: {
      name: "Nova Studio",
      slug: "nova",
      plan: "starter",
    },
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

  console.log("Created Users.");

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

    // Create 4-5 tasks per project
    const taskTitles = ["Research & Discovery", "Initial Concepts", "Development Phase 1", "Client Review", "Final Polishing"];
    for (let i = 0; i < taskTitles.length; i++) {
        await prisma.task.create({
            data: {
                orgId: pixelAgency.id,
                projectId: project.id,
                title: taskTitles[i],
                status: i < (p.progress / 20) ? "DONE" : i === Math.floor(p.progress / 20) ? "IN_PROGRESS" : "TODO",
                priority: i === 0 ? "HIGH" : "MEDIUM",
                dueDate: new Date(Date.now() + (i - 2) * 86400000 * 3), // Spaced out
                assigneeId: [alice.id, bob.id, carol.id, emma.id][i % 4],
            }
        });
    }

    // Create 3 comments per project
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

  // Nova Studio Projects
  await prisma.project.create({
    data: { orgId: novaStudio.id, name: "Internal Tools", status: "active", progress: 40, color: "#8b5cf6", managerId: novaAdmin.id }
  });
  await prisma.project.create({
    data: { orgId: novaStudio.id, name: "Legacy Support", status: "completed", progress: 100, color: "#6366f1", managerId: novaAdmin.id }
  });

  console.log("Created Projects, Tasks, and Comments.");

  // 4. Messages (Chat)
  const chatMessages = [
    { user: alice, text: "Hey team, welcome to the new chat!" },
    { user: bob, text: "Looks great. Ready to start on the Acme project." },
    { user: carol, text: "I'll handle the initial wireframes." },
    { user: emma, text: "And I'll start looking into the SEO audit assets." }
  ];

  for (const m of chatMessages) {
    await prisma.message.create({
        data: {
            orgId: pixelAgency.id,
            userId: m.user.id,
            body: m.text,
        }
    });
  }

  console.log("Seed process completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
