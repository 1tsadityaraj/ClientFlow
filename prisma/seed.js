const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Clean up existing data
  await prisma.comment.deleteMany({});
  await prisma.file.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.invite.deleteMany({});
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
      name: "Alice Johnson",
      email: "alice@pixel.co",
      hashedPassword,
      role: "admin",
      orgId: pixelAgency.id,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Martinez",
      email: "bob@pixel.co",
      hashedPassword,
      role: "manager",
      orgId: pixelAgency.id,
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Chen",
      email: "carol@pixel.co",
      hashedPassword,
      role: "member",
      orgId: pixelAgency.id,
    },
  });

  const dave = await prisma.user.create({
    data: {
      name: "Dave Wilson",
      email: "dave@acme.com",
      hashedPassword,
      role: "client",
      orgId: pixelAgency.id,
    },
  });

  const emma = await prisma.user.create({
    data: {
      name: "Emma Davis",
      email: "emma@pixel.co",
      hashedPassword,
      role: "member",
      orgId: pixelAgency.id,
    },
  });

  // Create Users for Nova Studio (for isolation demo)
  const frank = await prisma.user.create({
    data: {
      name: "Frank Nguyen",
      email: "frank@nova.co",
      hashedPassword,
      role: "admin",
      orgId: novaStudio.id,
    },
  });

  console.log("Created Users.");

  // 3. Create Projects for Pixel Agency
  const project1 = await prisma.project.create({
    data: {
      orgId: pixelAgency.id,
      name: "Acme Corp Website Redesign",
      description:
        "Complete overhaul of Acme Corp's corporate website with modern design, improved UX, and mobile-first approach.",
      managerId: bob.id,
      clientUserId: dave.id,
      status: "active",
      progress: 68,
      color: "#6366f1",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      orgId: pixelAgency.id,
      name: "Internal Dashboard v2.0",
      description:
        "Upgrading the internal analytics dashboard with real-time metrics, dark mode, and role-based views.",
      managerId: bob.id,
      status: "active",
      progress: 35,
      color: "#06b6d4",
    },
  });

  const project3 = await prisma.project.create({
    data: {
      orgId: pixelAgency.id,
      name: "Mobile App MVP",
      description:
        "React Native cross-platform mobile application for client project tracking and notifications.",
      managerId: alice.id,
      clientUserId: dave.id,
      status: "active",
      progress: 22,
      color: "#f59e0b",
    },
  });

  const project4 = await prisma.project.create({
    data: {
      orgId: pixelAgency.id,
      name: "Brand Identity Refresh",
      description:
        "Comprehensive brand refresh including new logo, color palette, typography, and brand guidelines document.",
      managerId: bob.id,
      status: "completed",
      progress: 100,
      color: "#10b981",
    },
  });

  const project5 = await prisma.project.create({
    data: {
      orgId: pixelAgency.id,
      name: "E-Commerce Platform",
      description:
        "Full-stack e-commerce solution with Stripe payments, inventory management, and admin panel.",
      managerId: alice.id,
      status: "active",
      progress: 55,
      color: "#ec4899",
    },
  });

  // Create a project for Nova Studio (for isolation demo)
  await prisma.project.create({
    data: {
      orgId: novaStudio.id,
      name: "Nova Internal Tools",
      description: "Internal tooling for Nova Studio operations.",
      managerId: frank.id,
      status: "active",
      progress: 10,
    },
  });

  console.log("Created Projects.");

  // 4. Create Tasks
  const now = new Date();
  const daysFromNow = (d) => new Date(now.getTime() + d * 86400000);

  const tasksData = [
    // -- Acme Corp Website Redesign --
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "Design homepage wireframes",
      status: "DONE",
      priority: "HIGH",
      assigneeId: carol.id,
      dueDate: daysFromNow(-5),
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "Implement responsive navigation",
      status: "DONE",
      priority: "HIGH",
      assigneeId: emma.id,
      dueDate: daysFromNow(-3),
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "Build hero section with animations",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      assigneeId: carol.id,
      dueDate: daysFromNow(2),
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "Client approval: homepage design",
      status: "TODO",
      priority: "HIGH",
      assigneeId: dave.id,
      dueDate: daysFromNow(4),
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "Integrate CMS for blog section",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: bob.id,
      dueDate: daysFromNow(7),
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      title: "SEO audit and meta tags setup",
      status: "TODO",
      priority: "LOW",
      assigneeId: emma.id,
      dueDate: daysFromNow(10),
    },
    // -- Internal Dashboard v2.0 --
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      title: "Setup database schema for metrics",
      status: "DONE",
      priority: "HIGH",
      assigneeId: alice.id,
      dueDate: daysFromNow(-7),
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      title: "Create real-time chart components",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: carol.id,
      dueDate: daysFromNow(3),
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      title: "Implement dark mode toggle",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      assigneeId: emma.id,
      dueDate: daysFromNow(5),
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      title: "Add role-based dashboard views",
      status: "TODO",
      priority: "HIGH",
      assigneeId: bob.id,
      dueDate: daysFromNow(8),
    },
    // -- Mobile App MVP --
    {
      orgId: pixelAgency.id,
      projectId: project3.id,
      title: "Setup React Native project",
      status: "DONE",
      priority: "HIGH",
      assigneeId: emma.id,
      dueDate: daysFromNow(-2),
    },
    {
      orgId: pixelAgency.id,
      projectId: project3.id,
      title: "Design mobile navigation flow",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: carol.id,
      dueDate: daysFromNow(1),
    },
    {
      orgId: pixelAgency.id,
      projectId: project3.id,
      title: "Implement push notifications",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: emma.id,
      dueDate: daysFromNow(12),
    },
    // -- Brand Identity Refresh --
    {
      orgId: pixelAgency.id,
      projectId: project4.id,
      title: "Create new logo concepts",
      status: "DONE",
      priority: "HIGH",
      assigneeId: carol.id,
      dueDate: daysFromNow(-14),
    },
    {
      orgId: pixelAgency.id,
      projectId: project4.id,
      title: "Finalize color palette",
      status: "DONE",
      priority: "MEDIUM",
      assigneeId: carol.id,
      dueDate: daysFromNow(-10),
    },
    {
      orgId: pixelAgency.id,
      projectId: project4.id,
      title: "Prepare brand guidelines PDF",
      status: "DONE",
      priority: "HIGH",
      assigneeId: bob.id,
      dueDate: daysFromNow(-6),
    },
    // -- E-Commerce Platform --
    {
      orgId: pixelAgency.id,
      projectId: project5.id,
      title: "Setup Stripe payment integration",
      status: "DONE",
      priority: "HIGH",
      assigneeId: alice.id,
      dueDate: daysFromNow(-4),
    },
    {
      orgId: pixelAgency.id,
      projectId: project5.id,
      title: "Build product catalog UI",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: carol.id,
      dueDate: daysFromNow(2),
    },
    {
      orgId: pixelAgency.id,
      projectId: project5.id,
      title: "Implement shopping cart logic",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      assigneeId: emma.id,
      dueDate: daysFromNow(6),
    },
    {
      orgId: pixelAgency.id,
      projectId: project5.id,
      title: "Admin panel with inventory management",
      status: "TODO",
      priority: "HIGH",
      assigneeId: bob.id,
      dueDate: daysFromNow(14),
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
      name: "homepage-wireframes-v2.fig",
      url: "https://example.com/wireframes.fig",
      size: "4.2 MB",
      type: "application/fig",
      uploadedById: carol.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      name: "brand-assets.zip",
      url: "https://example.com/assets.zip",
      size: "28.5 MB",
      type: "application/zip",
      uploadedById: bob.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      name: "client-requirements.pdf",
      url: "https://example.com/requirements.pdf",
      size: "1.8 MB",
      type: "application/pdf",
      uploadedById: dave.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      name: "database-schema.png",
      url: "https://example.com/schema.png",
      size: "1.2 MB",
      type: "image/png",
      uploadedById: alice.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      name: "api-documentation.md",
      url: "https://example.com/api-docs.md",
      size: "45 KB",
      type: "text/markdown",
      uploadedById: bob.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project4.id,
      name: "brand-guidelines-final.pdf",
      url: "https://example.com/brand-guide.pdf",
      size: "12.4 MB",
      type: "application/pdf",
      uploadedById: carol.id,
    },
    {
      orgId: pixelAgency.id,
      projectId: project5.id,
      name: "product-mockups.sketch",
      url: "https://example.com/mockups.sketch",
      size: "8.7 MB",
      type: "application/sketch",
      uploadedById: carol.id,
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
      body: "The wireframes look great! The navigation flow is really intuitive. Can we add a sticky header?",
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      userId: carol.id,
      body: "Thanks Dave! Absolutely, I'll add a sticky header with a blur backdrop. Will push the update by tomorrow.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      userId: bob.id,
      body: "Great progress team. Let's aim to have the hero section finalized by end of this week so we can move to the about page.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project1.id,
      userId: emma.id,
      body: "Navigation is done and responsive across all breakpoints. Ready for review! 🚀",
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      userId: alice.id,
      body: "Database schema is finalized and deployed. All indexes are in place for query performance.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      userId: carol.id,
      body: "Working on the chart components. Using Recharts for the real-time graphs. Should be done in 2 days.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project2.id,
      userId: bob.id,
      body: "Looks good! Make sure the charts support both light and dark modes from the start.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project3.id,
      userId: alice.id,
      body: "React Native project is scaffolded. Using Expo for faster iteration during MVP phase.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project3.id,
      userId: carol.id,
      body: "Started on the mobile nav design. Going with a bottom tab bar + drawer pattern.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project5.id,
      userId: alice.id,
      body: "Stripe integration is complete. Test payments are working with webhooks for order status updates.",
    },
    {
      orgId: pixelAgency.id,
      projectId: project5.id,
      userId: emma.id,
      body: "Shopping cart is taking shape. Implemented quantity controls and cart persistence with localStorage.",
    },
  ];

  for (const comment of commentsData) {
    await prisma.comment.create({ data: comment });
  }
  console.log("Created Comments.");

  // 7. Create Invites
  await prisma.invite.create({
    data: {
      orgId: pixelAgency.id,
      email: "newdesigner@pixel.co",
      role: "member",
      token: "demo-invite-token-123",
      expiresAt: daysFromNow(7),
    },
  });
  console.log("Created Invites.");

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📧 Demo login credentials:");
  console.log("   Admin:   alice@pixel.co / password123");
  console.log("   Manager: bob@pixel.co / password123");
  console.log("   Member:  carol@pixel.co / password123");
  console.log("   Client:  dave@acme.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
