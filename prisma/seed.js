const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Clean up existing data (optional, but good for idempotent seeds if using a fresh db)
  await prisma.comment.deleteMany({});
  await prisma.file.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.org.deleteMany({});

  console.log("Deleted existing records.");

  // 1. Create Orgs
  const pixelAgency = await prisma.org.create({
    data: {
      name: "Pixel Agency",
      slug: "pixel-agency",
      plan: "pro",
    },
  });

  const novaStudio = await prisma.org.create({
    data: {
      name: "Nova Studio",
      slug: "nova-studio",
      plan: "starter",
    },
  });

  console.log("Created Orgs.");

  // 2. Create Users for Pixel Agency
  const alice = await prisma.user.create({
    data: {
      name: "Alice Admin",
      email: "alice@pixel.co",
      hashedPassword,
      role: "admin",
      orgId: pixelAgency.id,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Manager",
      email: "bob@pixel.co",
      hashedPassword,
      role: "manager",
      orgId: pixelAgency.id,
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Member",
      email: "carol@pixel.co",
      hashedPassword,
      role: "member",
      orgId: pixelAgency.id,
    },
  });

  const dave = await prisma.user.create({
    data: {
      name: "Dave Client",
      email: "dave@acme.com",
      hashedPassword,
      role: "client",
      orgId: pixelAgency.id,
    },
  });

  console.log("Created Users.");

  // 3. Create Projects for Pixel Agency
  const project1 = await prisma.project.create({
    data: {
      orgId: pixelAgency.id,
      name: "Acme Corp Website Redesign",
      description: "A complete overhaul of the Acme Corp corporate website.",
      managerId: bob.id,
      clientUserId: dave.id,
      status: "active",
      progress: 40,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      orgId: pixelAgency.id,
      name: "Internal Dashboard 2.0",
      description: "Upgrading our internal analytics dashboard.",
      managerId: bob.id,
      status: "active",
      progress: 15,
    },
  });

  console.log("Created Projects.");

  // 4. Create Tasks
  const tasksData = [
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "Design Homepage Wireframes",
      status: "DONE",
      priority: "HIGH",
      assigneeId: carol.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "Approve Homepage Design",
      status: "TODO",
      priority: "HIGH",
      assigneeId: dave.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "Develop Navigation Menu",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      assigneeId: bob.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      title: "Setup Database Schema",
      status: "DONE",
      priority: "HIGH",
      assigneeId: alice.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      title: "Create Mockups",
      status: "IN_PROGRESS",
      priority: "LOW",
      assigneeId: carol.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      title: "Integrate Auth",
      status: "TODO",
      priority: "HIGH",
      assigneeId: bob.id,
    },
  ];

  for (const task of tasksData) {
    await prisma.task.create({ data: task });
  }
  console.log("Created Tasks.");

  // 5. Create Files
  const filesData = [
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      name: "wireframes.pdf",
      url: "https://example.com/wireframes.pdf",
      size: "2.5MB",
      type: "application/pdf",
      uploadedById: carol.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      name: "assets.zip",
      url: "https://example.com/assets.zip",
      size: "15MB",
      type: "application/zip",
      uploadedById: bob.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      name: "schema.png",
      url: "https://example.com/schema.png",
      size: "1.2MB",
      type: "image/png",
      uploadedById: alice.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      name: "notes.txt",
      url: "https://example.com/notes.txt",
      size: "12KB",
      type: "text/plain",
      uploadedById: bob.id,
    },
  ];

  for (const file of filesData) {
    await prisma.file.create({ data: file });
  }
  console.log("Created Files.");

  // 6. Create Comments
  const commentsData = [
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      userId: dave.id,
      body: "The wireframes look great! Looking forward to the final design.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      userId: carol.id,
      body: "Thanks Dave! We will start working on the high-fidelity mockups next.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      userId: alice.id,
      body: "The database schema is finalized.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      userId: bob.id,
      body: "Great job, I will start on the API layer soon.",
    },
  ];

  for (const comment of commentsData) {
    await prisma.comment.create({ data: comment });
  }
  console.log("Created Comments.");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
