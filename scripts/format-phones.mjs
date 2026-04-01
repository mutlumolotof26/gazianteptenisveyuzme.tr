/**
 * Telefon numaralarını "0XXX XXX XXXX" formatına getirir.
 * İsim/tire yazılanların telefon alanını null yapar.
 * node scripts/format-phones.mjs
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const dbUrl = envFile.match(/DATABASE_URL="([^"]+)"/)?.[1];
const sql = postgres(dbUrl, { ssl: 'require' });

// "0XXX XXX XXXX" formatına çevir
function formatPhone(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // Harf içeriyorsa (isim yazılmış) veya sadece tire/boşluksa → null
  if (/[a-zA-ZçğıöşüÇĞİÖŞÜ]/i.test(trimmed)) return null;
  if (/^[-–—\s]+$/.test(trimmed)) return null;

  // Sadece rakamları al
  const digits = trimmed.replace(/[^0-9]/g, '');

  // 10 haneli (5xx...) veya 11 haneli (05xx...)
  let d10 = digits;
  if (digits.length === 11 && digits.startsWith('0')) d10 = digits.slice(1);
  else if (digits.length === 12 && digits.startsWith('90')) d10 = digits.slice(2);

  if (d10.length !== 10) return null;

  // Format: 0XXX XXX XXXX
  return `0${d10.slice(0,3)} ${d10.slice(3,6)} ${d10.slice(6)}`;
}

async function main() {
  console.log('📋 Tüm üye telefonları okunuyor...');
  const members = await sql`SELECT id, ad, soyad, telefon FROM "Member" WHERE telefon IS NOT NULL`;
  console.log(`✅ ${members.length} kayıt bulundu\n`);

  let guncellendi = 0, nulllandi = 0, degismedi = 0, hata = 0;

  for (const m of members) {
    const formatted = formatPhone(m.telefon);
    if (formatted === null && !/[a-zA-ZçğıöşüÇĞİÖŞÜ]/i.test(m.telefon ?? '') && /^[-–—\s]*$/.test(m.telefon ?? '')) {
      // Sadece tire/boşluk → null yap
      await sql`UPDATE "Member" SET telefon = NULL, "updatedAt" = NOW() WHERE id = ${m.id}`;
      console.log(`  ➖ null: ${m.ad} ${m.soyad} — "${m.telefon}"`);
      nulllandi++;
    } else if (formatted === null) {
      // İsim veya geçersiz → null yap
      await sql`UPDATE "Member" SET telefon = NULL, "updatedAt" = NOW() WHERE id = ${m.id}`;
      console.log(`  ➖ null (isim/geçersiz): ${m.ad} ${m.soyad} — "${m.telefon}"`);
      nulllandi++;
    } else if (formatted !== m.telefon) {
      await sql`UPDATE "Member" SET telefon = ${formatted}, "updatedAt" = NOW() WHERE id = ${m.id}`;
      guncellendi++;
    } else {
      degismedi++;
    }
  }

  await sql.end();

  console.log('\n╔═════════════════════════════════╗');
  console.log('║            SONUÇ                ║');
  console.log('╠═════════════════════════════════╣');
  console.log(`║ ✅ Format güncellendi: ${String(guncellendi).padStart(5)}    ║`);
  console.log(`║ ➖ Null yapıldı:       ${String(nulllandi).padStart(5)}    ║`);
  console.log(`║ ⏭️  Zaten doğru:       ${String(degismedi).padStart(5)}    ║`);
  console.log(`║ ❌ Hata:              ${String(hata).padStart(5)}    ║`);
  console.log('╚═════════════════════════════════╝');
}

main().catch(err => { console.error('HATA:', err.message); process.exit(1); });
