
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);
    
  } catch (e) {
    console.error('Failed to connect to the database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
