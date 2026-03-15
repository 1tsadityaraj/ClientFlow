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

  const grace = await prisma.user.create({
    data: {
      name: "Grace Kim",
      email: "grace@nova.co",
      hashedPassword,
      role: "manager",
      orgId: novaStudio.id,
    },
  });

  const henry = await prisma.user.create({
    data: {
      name: "Henry Patel",
      email: "henry@startup.io",
      hashedPassword,
      role: "client",
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

  // Create projects for Nova Studio (for isolation demo)
  const novaProject1 = await prisma.project.create({
    data: {
      orgId: novaStudio.id,
      name: "Nova Internal Tools",
      description: "Internal tooling for Nova Studio operations.",
      managerId: frank.id,
      status: "active",
      progress: 45,
      color: "#ec4899",
    },
  });

  const novaProject2 = await prisma.project.create({
    data: {
      orgId: novaStudio.id,
      name: "Startup.io Branding",
      description: "Complete brand identity for Startup.io — logos, guidelines, and marketing collateral.",
      managerId: grace.id,
      clientUserId: henry.id,
      status: "active",
      progress: 72,
      color: "#f59e0b",
    },
  });

  const novaProject3 = await prisma.project.create({
    data: {
      orgId: novaStudio.id,
      name: "API Gateway Redesign",
      description: "Modernizing the API gateway with rate limiting and caching layers.",
      managerId: frank.id,
      status: "completed",
      progress: 100,
      color: "#10b981",
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

  // 8. Create Nova Studio Tasks
  const novaTasksData = [
    {
      orgId: novaStudio.id,
      projectId: novaProject1.id,
      title: "Setup CI/CD pipeline",
      status: "DONE",
      priority: "HIGH",
      assigneeId: frank.id,
      dueDate: daysFromNow(-8),
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject1.id,
      title: "Build admin dashboard scaffold",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: grace.id,
      dueDate: daysFromNow(3),
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject1.id,
      title: "Implement user analytics tracking",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: frank.id,
      dueDate: daysFromNow(10),
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject2.id,
      title: "Create logo concepts — 3 directions",
      status: "DONE",
      priority: "HIGH",
      assigneeId: grace.id,
      dueDate: daysFromNow(-12),
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject2.id,
      title: "Client review: round 1 feedback",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: henry.id,
      dueDate: daysFromNow(1),
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject2.id,
      title: "Finalize typography & color system",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: grace.id,
      dueDate: daysFromNow(6),
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject3.id,
      title: "Implement JWT auth middleware",
      status: "DONE",
      priority: "HIGH",
      assigneeId: frank.id,
      dueDate: daysFromNow(-20),
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject3.id,
      title: "Add Redis caching layer",
      status: "DONE",
      priority: "HIGH",
      assigneeId: frank.id,
      dueDate: daysFromNow(-15),
    },
  ];

  for (const task of novaTasksData) {
    await prisma.task.create({ data: task });
  }
  console.log("Created Nova Studio Tasks.");

  // 9. Create Nova Studio Comments
  const novaCommentsData = [
    {
      orgId: novaStudio.id,
      projectId: novaProject1.id,
      userId: frank.id,
      body: "CI/CD is live — every push to main auto-deploys to staging. Production requires manual approval.",
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject1.id,
      userId: grace.id,
      body: "Dashboard scaffold is progressing well. Using the same component library as our client projects for consistency.",
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject2.id,
      userId: grace.id,
      body: "Uploaded 3 logo directions. Option B with the geometric mark is my recommendation.",
    },
    {
      orgId: novaStudio.id,
      projectId: novaProject2.id,
      userId: henry.id,
      body: "Love Option B! Can we explore a warmer color palette? Something with terracotta tones.",
    },
  ];

  for (const comment of novaCommentsData) {
    await prisma.comment.create({ data: comment });
  }
  console.log("Created Nova Studio Comments.");

  // 10. Create Audit Logs (Pixel Agency)
  const auditLogsData = [
    // Org-level actions
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "org.created",
      entity: "Org",
      entityId: pixelAgency.id,
      metadata: JSON.stringify({ name: "Pixel Agency", plan: "pro" }),
      createdAt: daysFromNow(-30),
    },
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "org.updated",
      entity: "Org",
      entityId: pixelAgency.id,
      metadata: JSON.stringify({ field: "primaryColor", from: "#6366f1", to: "#4f46e5" }),
      createdAt: daysFromNow(-28),
    },
    // Member actions
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "member.invited",
      entity: "User",
      entityId: bob.id,
      metadata: JSON.stringify({ email: "bob@pixel.co", role: "manager" }),
      createdAt: daysFromNow(-29),
    },
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "member.invited",
      entity: "User",
      entityId: carol.id,
      metadata: JSON.stringify({ email: "carol@pixel.co", role: "member" }),
      createdAt: daysFromNow(-28),
    },
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "member.invited",
      entity: "User",
      entityId: emma.id,
      metadata: JSON.stringify({ email: "emma@pixel.co", role: "member" }),
      createdAt: daysFromNow(-27),
    },
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "member.invited",
      entity: "User",
      entityId: dave.id,
      metadata: JSON.stringify({ email: "dave@acme.com", role: "client" }),
      createdAt: daysFromNow(-26),
    },
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "member.role_changed",
      entity: "User",
      entityId: emma.id,
      metadata: JSON.stringify({ from: "member", to: "member", email: "emma@pixel.co" }),
      createdAt: daysFromNow(-20),
    },
    // Project actions
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "project.created",
      entity: "Project",
      entityId: project1.id,
      metadata: JSON.stringify({ name: "Acme Corp Website Redesign" }),
      createdAt: daysFromNow(-25),
    },
    {
      orgId: pixelAgency.id,
      userId: bob.id,
      action: "project.created",
      entity: "Project",
      entityId: project2.id,
      metadata: JSON.stringify({ name: "Internal Dashboard v2.0" }),
      createdAt: daysFromNow(-22),
    },
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "project.created",
      entity: "Project",
      entityId: project3.id,
      metadata: JSON.stringify({ name: "Mobile App MVP" }),
      createdAt: daysFromNow(-18),
    },
    {
      orgId: pixelAgency.id,
      userId: bob.id,
      action: "project.created",
      entity: "Project",
      entityId: project4.id,
      metadata: JSON.stringify({ name: "Brand Identity Refresh" }),
      createdAt: daysFromNow(-15),
    },
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "project.created",
      entity: "Project",
      entityId: project5.id,
      metadata: JSON.stringify({ name: "E-Commerce Platform" }),
      createdAt: daysFromNow(-12),
    },
    {
      orgId: pixelAgency.id,
      userId: bob.id,
      action: "project.updated",
      entity: "Project",
      entityId: project4.id,
      metadata: JSON.stringify({ field: "status", from: "active", to: "completed" }),
      createdAt: daysFromNow(-6),
    },
    // Task actions
    {
      orgId: pixelAgency.id,
      userId: carol.id,
      action: "task.status_changed",
      entity: "Task",
      metadata: JSON.stringify({ title: "Design homepage wireframes", from: "IN_PROGRESS", to: "DONE" }),
      createdAt: daysFromNow(-5),
    },
    {
      orgId: pixelAgency.id,
      userId: emma.id,
      action: "task.status_changed",
      entity: "Task",
      metadata: JSON.stringify({ title: "Implement responsive navigation", from: "IN_PROGRESS", to: "DONE" }),
      createdAt: daysFromNow(-3),
    },
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "task.created",
      entity: "Task",
      metadata: JSON.stringify({ title: "Setup Stripe payment integration", project: "E-Commerce Platform" }),
      createdAt: daysFromNow(-10),
    },
    // File actions
    {
      orgId: pixelAgency.id,
      userId: carol.id,
      action: "file.uploaded",
      entity: "File",
      metadata: JSON.stringify({ name: "homepage-wireframes-v2.fig", size: "4.2 MB" }),
      createdAt: daysFromNow(-5),
    },
    {
      orgId: pixelAgency.id,
      userId: bob.id,
      action: "file.uploaded",
      entity: "File",
      metadata: JSON.stringify({ name: "brand-assets.zip", size: "28.5 MB" }),
      createdAt: daysFromNow(-4),
    },
    {
      orgId: pixelAgency.id,
      userId: dave.id,
      action: "file.uploaded",
      entity: "File",
      metadata: JSON.stringify({ name: "client-requirements.pdf", size: "1.8 MB" }),
      createdAt: daysFromNow(-3),
    },
    // Comment action
    {
      orgId: pixelAgency.id,
      userId: dave.id,
      action: "comment.added",
      entity: "Comment",
      metadata: JSON.stringify({ project: "Acme Corp Website Redesign", preview: "The wireframes look great!" }),
      createdAt: daysFromNow(-2),
    },
    // Recent billing/plan event
    {
      orgId: pixelAgency.id,
      userId: alice.id,
      action: "org.updated",
      entity: "Org",
      entityId: pixelAgency.id,
      metadata: JSON.stringify({ field: "plan", from: "starter", to: "pro" }),
      createdAt: daysFromNow(-1),
    },
  ];

  // Audit logs for Nova Studio
  const novaAuditData = [
    {
      orgId: novaStudio.id,
      userId: frank.id,
      action: "org.created",
      entity: "Org",
      entityId: novaStudio.id,
      metadata: JSON.stringify({ name: "Nova Studio", plan: "starter" }),
      createdAt: daysFromNow(-20),
    },
    {
      orgId: novaStudio.id,
      userId: frank.id,
      action: "member.invited",
      entity: "User",
      entityId: grace.id,
      metadata: JSON.stringify({ email: "grace@nova.co", role: "manager" }),
      createdAt: daysFromNow(-19),
    },
    {
      orgId: novaStudio.id,
      userId: frank.id,
      action: "project.created",
      entity: "Project",
      entityId: novaProject1.id,
      metadata: JSON.stringify({ name: "Nova Internal Tools" }),
      createdAt: daysFromNow(-18),
    },
  ];

  for (const log of [...auditLogsData, ...novaAuditData]) {
    await prisma.auditLog.create({ data: log });
  }
  console.log("Created Audit Logs.");

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📧 Demo login credentials:");
  console.log("  ─── Pixel Agency (Pro Plan) ───");
  console.log("   Admin:   alice@pixel.co   / password123");
  console.log("   Manager: bob@pixel.co     / password123");
  console.log("   Member:  carol@pixel.co   / password123");
  console.log("   Client:  dave@acme.com    / password123");
  console.log("  ─── Nova Studio (Starter Plan — Isolation Demo) ───");
  console.log("   Admin:   frank@nova.co    / password123");
  console.log("   Manager: grace@nova.co    / password123");
  console.log("   Client:  henry@startup.io / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
