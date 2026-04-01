import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.adminUser.findMany({ select: { id: true, email: true, password: true } });
  console.log('Kullanıcılar:', JSON.stringify(users, null, 2));

  if (users.length > 0) {
    const valid = await bcrypt.compare('admin123', users[0].password);
    console.log('admin123 geçerli mi:', valid);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
