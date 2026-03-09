import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(__dirname, "../prisma/dev.db");
const sqlite = new Database(dbPath);
const adapter = new PrismaBetterSQLite3(sqlite);
const prisma = new PrismaClient({ adapter } as Parameters<typeof PrismaClient>[0]);

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
      icerik: "Bu yıl 5. kez düzenlenen Gaziantep Açık Tenis Turnuvası kayıtları başladı. Turnuva 15-20 Nisan 2024 tarihleri arasında kulübümüzün kortlarında oynanacak.",
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

  // Örnek etkinlikler
  const events = [
    {
      baslik: "Gaziantep Açık Tenis Turnuvası",
      aciklama: "Yıllık geleneksel tenis turnuvamız.",
      tarih: new Date("2026-04-15T09:00:00"),
      yer: "Kulüp Ana Kortu",
      kategori: "turnuva",
      aktif: true,
    },
    {
      baslik: "Yüzme Gala Gecesi",
      aciklama: "Sezon sonu yüzme yarışmaları ve ödül töreni.",
      tarih: new Date("2026-05-20T18:00:00"),
      yer: "Olimpik Havuz",
      kategori: "yuzme",
      aktif: true,
    },
    {
      baslik: "Çocuk Tenis Festivali",
      aciklama: "8-12 yaş grubu çocuklar için eğlenceli tenis etkinliği.",
      tarih: new Date("2026-06-08T10:00:00"),
      yer: "Mini Kort",
      kategori: "tenis",
      aktif: true,
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }
  console.log("✅ Örnek etkinlikler eklendi");

  console.log("\n🎉 Seed tamamlandı!");
  console.log("\n📋 Admin Bilgileri:");
  console.log("   E-posta: admin@gazitenisyuzme.com");
  console.log("   Şifre: admin123");
  console.log("\n🚀 Siteyi başlatmak için: npm run dev");
  console.log("📍 Admin panel: http://localhost:3000/admin/login");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
