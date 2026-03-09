import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// .env.local'i yükle (Vercel env'leri için)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config(); // fallback .env

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Admin kullanıcısı oluştur
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@gazitenisyuzme.com" },
    update: {},
    create: {
      email: "admin@gazitenisyuzme.com",
      password: hashedPassword,
      name: "Site Yöneticisi",
      role: "admin",
    },
  });
  console.log("✅ Admin kullanıcısı:", admin.email);

  // Örnek üyeler
  const members = [
    { ad: "Ahmet", soyad: "Yılmaz", email: "ahmet@example.com", telefon: "0555 111 22 33", uyeTipi: "premium", spor: "tenis", durum: "aktif" },
    { ad: "Fatma", soyad: "Demir", email: "fatma@example.com", telefon: "0555 222 33 44", uyeTipi: "standart", spor: "yuzme", durum: "aktif" },
    { ad: "Mehmet", soyad: "Kaya", email: "mehmet@example.com", telefon: "0555 333 44 55", uyeTipi: "aile", spor: "her_ikisi", durum: "aktif" },
    { ad: "Zeynep", soyad: "Şahin", email: "zeynep@example.com", uyeTipi: "ogrenci", spor: "yuzme", durum: "beklemede" },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { email: member.email },
      update: {},
      create: member,
    });
  }
  console.log("✅ Örnek üyeler eklendi");

  // Örnek haberler
  const news = [
    {
      baslik: "Gaziantep Açık Tenis Turnuvası Başlıyor!",
      ozet: "Bu yıl 5. kez düzenlenen Gaziantep Açık Tenis Turnuvası kayıtları başladı.",
      icerik: "Bu yıl 5. kez düzenlenen Gaziantep Açık Tenis Turnuvası kayıtları başladı. Turnuva Nisan tarihleri arasında kulübümüzün kortlarında oynanacak.",
      kategori: "tenis",
      aktif: true,
    },
    {
      baslik: "Yaz Yüzme Kursları Kayıtları Açıldı",
      ozet: "Temmuz-Ağustos dönemi yaz yüzme kurslarımıza kayıtlar başlamıştır.",
      icerik: "Yaz tatilinde çocuklarınızın zamanını verimli geçirmesi için yaz yüzme kurslarımız başlıyor. 5-14 yaş arası çocuklara yönelik kurslar.",
      kategori: "yuzme",
      aktif: true,
    },
    {
      baslik: "Kulüp Tesisleri Yenilendi",
      ozet: "Üyelerimize daha iyi hizmet sunmak için tesisler yenilendi.",
      icerik: "Kulübümüz kapsamlı yenileme çalışması gerçekleştirdi. Soyunma odaları, dinlenme alanları ve yeni ekipmanlar hazır.",
      kategori: "genel",
      aktif: true,
    },
  ];

  for (const item of news) {
    await prisma.news.create({ data: item });
  }
  console.log("✅ Örnek haberler eklendi");

  // SiteSettings oluştur
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  console.log("✅ Site ayarları oluşturuldu");

  console.log("\n🎉 Seed tamamlandı!");
  console.log("\n📋 Admin Bilgileri:");
  console.log("   E-posta: admin@gazitenisyuzme.com");
  console.log("   Şifre: admin123");
  console.log("\n🌐 Admin panel: https://gazianteptenisveyuzme.tr/admin/login");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
