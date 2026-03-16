async function go() {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst({ where: { role: 'admin' }});
    console.log("Admin ID:", user.id);
    console.log("Org ID:", user.orgId);
    
    // Test validations
    const { createProjectSchema, validate } = require('./lib/validations.js');
    console.log(validate(createProjectSchema, { name: 'Test', color: '#112233', clientUserId: '' }));
    prisma.$disconnect();
}
go().catch(console.error);
