import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAdmin() {
  console.log('Checking database users...');
  const users = await prisma.user.findMany();
  console.log('Total users in DB:', users.length);
  for (const u of users) {
    console.log(`- Email: ${u.email}, Role: ${u.role}, ID: ${u.id}`);
    const match = await bcrypt.compare('Admin@123', u.passwordHash);
    console.log(`  Password 'Admin@123' match: ${match}`);
  }

  // Force reset admin@ramjicollection.com password to Admin@123 just in case!
  const newHash = await bcrypt.hash('Admin@123', 10);
  const updated = await prisma.user.upsert({
    where: { email: 'admin@ramjicollection.com' },
    update: {
      passwordHash: newHash,
      role: 'ADMIN'
    },
    create: {
      email: 'admin@ramjicollection.com',
      passwordHash: newHash,
      firstName: 'Ram Ji',
      lastName: 'Owner',
      phone: '919876543210',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user upserted:', updated.email, 'Role:', updated.role);

  // Test bcrypt compare again
  const doubleCheck = await bcrypt.compare('Admin@123', updated.passwordHash);
  console.log('✅ Double check bcrypt comparison:', doubleCheck);
}

checkAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
