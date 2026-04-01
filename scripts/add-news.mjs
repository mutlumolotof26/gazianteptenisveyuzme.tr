import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

// .env.local önce, sonra .env
try { dotenv.config({ path: ".env.local" }); } catch {}
dotenv.config();

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const haberler = [
  {
    baslik: "Gaziantep'te Çocuklar İçin Yüzme Kursu — Kaç Yaşında Başlanmalı?",
    ozet: "Çocuğunuz için en doğru yüzme kursu yaşını ve Gaziantep'teki en iyi yüzme eğitimi seçeneklerini anlattık.",
    icerik: `Yüzme, çocukların hayatı boyunca kullanacakları en temel becerilerden biridir. Peki Gaziantep'te çocuklar için yüzme kursuna kaç yaşında başlanmalı?

Uzmanlar, çocukların yüzmeye 2 yaşından itibaren başlayabileceğini söylüyor. Bu yaşta verilen eğitim su korkusunu yenmek ve suya alışmak için idealdir.

2-4 Yaş: Bebek Yüzme Programı
Bu yaş grubunda ebeveyn eşliğinde verilen derslerle çocuklar suya alıştırılır. GTY Spor Kulübü'nde haftada 2 gün, 30 dakikalık seanslarla bebek yüzme programı uygulanmaktadır.

5-8 Yaş: Küçükler Programı
Çocuklar bu yaşta temel yüzme tekniklerini öğrenmeye hazırdır. Serbest stil ve sırt üstü yüzme bu dönemde öğretilir. Haftada 3 gün, 45 dakikalık derslerle hızlı ilerleme sağlanır.

9-14 Yaş: Çocuk Programı
Bu yaş grubunda kelebek ve kurbağalama gibi ileri teknikler öğretilir. Yarışmacı yüzmeye ilgi duyan çocuklar için özel antrenman programları da mevcuttur.

Gaziantep'te Yüzme Kursu Nerede?
GTY Gençlik Spor Kulübü, Şehitkamil ilçesi Batıkent'te 50 metre olimpik yüzme havuzu ile hizmet vermektedir. Uzman antrenör kadrosu ve küçük grup eğitimiyle çocuğunuz kısa sürede yüzmeyi öğrenir. Kayıt ve fiyat bilgisi için 0551 245 82 74 numaralı hattı arayabilirsiniz.`,
    kategori: "yuzme",
  },
  {
    baslik: "Yetişkinler İçin Gaziantep Yüzme Kursu — Hiç Geç Değil",
    ozet: "Yüzme bilmiyorsanız endişelenmeyin. GTY Spor Kulübü'nde yetişkinlere özel yüzme kursları her seviyeye uygundur.",
    icerik: `Yüzme öğrenmek için yaş sınırı yoktur. Gaziantep'te yetişkinlere yönelik yüzme kursları, sıfırdan başlayanlar için bile idealdir.

Yetişkin Yüzme Kursunun Faydaları
Yüzme tüm vücudu çalıştıran, eklemlere zarar vermeyen ve kalp sağlığını koruyan en etkili sporlardan biridir. Haftada 3 gün düzenli yüzme; kilo vermeye, stresi azaltmaya ve uyku kalitesini artırmaya yardımcı olur.

GTY Spor Kulübü Yetişkin Programı
GTY Spor Kulübü'nde 18 yaş üstü yetişkinler için haftada 3 gün, 60 dakikalık kurslar düzenlenmektedir. Başlangıç, orta ve ileri seviye gruplarımızda uzman antrenörler eşliğinde ilerleme kaydedersiniz.

Özel Ders İmkânı
Grup derslerinin yanı sıra birebir özel ders seçeneğimiz de mevcuttur. Kendi programınıza göre randevu alarak öğrenme sürecinizi hızlandırabilirsiniz.

Kayıt için 0551 245 82 74 numaralı hattı arayın veya web sitemizden iletişime geçin. Şehitkamil, Batıkent, Gaziantep'te olimpik yüzme havuzumuz sizi bekliyor.`,
    kategori: "yuzme",
  },
  {
    baslik: "Bebek Yüzme Kursu Nedir? Gaziantep'te Bebek Yüzme",
    ozet: "2 yaşından küçük bebekler için yüzme kursu mümkün mü? GTY Spor Kulübü bebek yüzme programı hakkında her şey.",
    icerik: `Bebek yüzme, 6 aydan 3 yaşa kadar olan bebeklerin ebeveyn eşliğinde suyla tanışmasını sağlayan özel bir programdır. Gaziantep'te bebek yüzme kursu için GTY Spor Kulübü tercih edilen adreslerden biridir.

Bebek Yüzme Kursunun Faydaları
- Su korkusunu önler ve suya güven geliştirir
- Motor becerilerin gelişimini destekler
- Ebeveyn-bebek bağını güçlendirir
- Bağışıklık sistemini kuvvetlendirir
- Uyku düzenini iyileştirir

GTY Bebek Yüzme Programı
GTY Spor Kulübü'nde bebek yüzme programları 2 yaşından itibaren uygulanmaktadır. Haftada 2 gün, 30 dakikalık seanslar halinde verilen eğitimde ebeveyn havuzda bebeğiyle birlikte bulunur.

Isıtmalı Havuz Güvencesi
Bebeklerin sağlığı için havuzumuz yıl boyu 28-30°C sıcaklıkta tutulmaktadır. Kapalı olimpik havuz sayesinde kış aylarında da kesintisiz eğitim verilmektedir.

Gaziantep Şehitkamil'de bebek yüzme kursu için 0551 245 82 74 numaralı hattı arayın.`,
    kategori: "yuzme",
  },
  {
    baslik: "Gaziantep Yüzme Kursu Fiyatları 2026 — GTY Spor Kulübü",
    ozet: "Gaziantep yüzme kursu ücretleri hakkında merak edilenleri derledik. Çocuk, bebek ve yetişkin programları için fiyat bilgisi.",
    icerik: `Gaziantep'te yüzme kursu fiyatları araştırıyorsanız doğru adrestesiniz. GTY Gençlik Spor Kulübü olarak şeffaf fiyatlandırma politikamızla her bütçeye uygun programlar sunuyoruz.

Yüzme Kursu Ücretlerini Etkileyen Faktörler
Yüzme kursu fiyatları birkaç faktöre göre değişmektedir:
- Program türü (grup dersi / özel ders)
- Yaş grubu (bebek, çocuk, yetişkin)
- Haftalık seans sayısı
- Dönem süresi (aylık / dönemlik)

Grup Dersleri
GTY Spor Kulübü'nde grup dersleri ekonomik ve etkili bir seçenektir. Küçük gruplarla çalışıldığı için her öğrenciye yeterli ilgi gösterilmektedir.

Özel Dersler
Bireysel ilgi ve daha hızlı ilerleme için özel ders seçeneğimiz mevcuttur.

Güncel Fiyat Bilgisi İçin
Yüzme kursu 2026 fiyatları ve kayıt koşulları için 0551 245 82 74 numaralı hattımızı arayabilir veya web sitemizin iletişim formunu kullanabilirsiniz. Şehitkamil, Batıkent, Gaziantep adresimizde sizi ağırlamaktan memnuniyet duyarız.`,
    kategori: "yuzme",
  },
  {
    baslik: "Olimpik Yüzme Havuzu Gaziantep — GTY Spor Kulübü Tesisleri",
    ozet: "Gaziantep'teki olimpik yüzme havuzu özellikleri, ölçüleri ve tesis imkânları hakkında detaylı bilgi.",
    icerik: `Gaziantep'te olimpik yüzme havuzu arayanlar için GTY Gençlik Spor Kulübü, Şehitkamil ilçesinde dünya standartlarında yüzme tesisi sunmaktadır.

Havuz Özellikleri
GTY Spor Kulübü bünyesinde 3 ayrı havuz bulunmaktadır:

50 Metre Olimpik Yüzme Havuzu
Uluslararası müsabaka standartlarında 50 metre uzunluğunda olimpik havuzumuz, hem profesyonel sporcular hem de kurs öğrencileri tarafından kullanılmaktadır.

25 Metre Isınma Havuzu
Antrenman öncesi ısınma ve teknik çalışmalar için 25 metre ısınma havuzumuz her zaman hazırdır.

Çocuk Havuzu
Küçük yüzücüler için özel tasarlanmış, güvenli ve sığ çocuk havuzumuzda minikler korkusuzca yüzme öğrenir.

Isıtma Sistemi
Tüm havuzlarımız yıl boyu 28°C sıcaklıkta tutulmaktadır. Kapalı tesis sayesinde kış aylarında da konforlu bir yüzme deneyimi yaşarsınız.

Konum ve Ulaşım
Batıkent Muhsin Yazıcıoğlu Cd. No:14, Şehitkamil, Gaziantep adresinde bulunan tesisimize geniş otopark imkânıyla kolayca ulaşabilirsiniz. Bilgi için 0551 245 82 74.`,
    kategori: "yuzme",
  },
];

async function main() {
  console.log("Haberler ekleniyor...");
  for (const haber of haberler) {
    const created = await prisma.news.create({
      data: {
        baslik: haber.baslik,
        ozet: haber.ozet,
        icerik: haber.icerik,
        kategori: haber.kategori,
        aktif: true,
      },
    });
    console.log(`✅ Eklendi: ${created.baslik}`);
  }
  console.log("Tüm haberler eklendi!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
