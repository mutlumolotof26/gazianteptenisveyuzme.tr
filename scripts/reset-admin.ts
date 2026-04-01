import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash('admin123', 12);
  const result = await prisma.adminUser.updateMany({
    data: { password: hash }
  });
  console.log('Güncellendi:', result);

  // Doğrula
  const user = await prisma.adminUser.findFirst();
  const valid = await bcrypt.compare('admin123', user!.password);
  console.log('Doğrulama:', valid);
  console.log('Email:', user!.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
