import { prisma } from '../apps/api/src/config/db';

async function checkLogs() {
  const logs = await prisma.whatsAppLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Recent WhatsApp Logs in DB:', logs);
}

checkLogs().catch(console.error).finally(() => prisma.$disconnect());
