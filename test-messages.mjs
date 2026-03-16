import { prisma } from './lib/prisma.js';

async function test() {
  try {
    console.log("Starting test...");
    const org = await prisma.org.findFirst();
    if (!org) {
       console.log("No org found");
       return;
    }
    console.log("Testing with Org ID:", org.id);
    
    const messages = await prisma.message.findMany({
      where: { orgId: org.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
    });
    console.log("Messages found:", messages.length);
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    process.exit(0);
  }
}

test();
