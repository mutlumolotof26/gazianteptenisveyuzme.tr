/**
 * Excel sayfalarına göre üye tiplerini günceller:
 * BİREY 11.00-12.00   → birey
 * YETİŞKİN ERKEK      → yetiskin_erkek
 * YETİŞKİN BAYAN      → yetiskin_bayan
 * Diğer sayfalar      → kursiyerler (değişmez)
 */

import * as XLSX from '../node_modules/xlsx/xlsx.mjs';
import postgres from '../node_modules/postgres/src/index.js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8');
const dbUrl = env.match(/DATABASE_URL="([^"]+)"/)?.[1]?.trim();
if (!dbUrl) throw new Error('DATABASE_URL bulunamadı');
const sql = postgres(dbUrl, { ssl: 'require' });

const FILE = 'C:/Users/aytek/havuz.xlsx';

// Sayfa → hedef üye tipi
const SHEET_TYPES = {
  'BİREY 11.00-12.00': 'birey',
  'YETİŞKİN ERKEK ':   'yetiskin_erkek',
  'YETİŞKİN BAYAN ':   'yetiskin_bayan',
};

// İsim normalizer
const norm = (s) => String(s ?? '').trim().toUpperCase()
  .replace(/İ/g,'I').replace(/Ğ/g,'G').replace(/Ü/g,'U')
  .replace(/Ş/g,'S').replace(/Ö/g,'O').replace(/Ç/g,'C');

const wb = XLSX.read(readFileSync(FILE));

// DB'den tüm aktif üyeleri çek
const allMembers = await sql`SELECT id, ad, soyad, "tcKimlik", "uyeTipi" FROM "Member"`;
console.log(`DB'de ${allMembers.length} üye`);

let totalUpdated = 0;

for (const [sheetName, targetType] of Object.entries(SHEET_TYPES)) {
  const ws = wb.Sheets[sheetName];
  if (!ws) { console.log(`⚠ Sayfa bulunamadı: ${sheetName}`); continue; }

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const nameCol = 1; // tüm bu sayfalar için isim 2. sütunda

  const names = rows
    .slice(1)
    .map(r => norm(r[nameCol]))
    .filter(n => n.length > 2 && !/^\d+$/.test(n));

  console.log(`\n=== ${sheetName} → ${targetType} (${names.length} isim) ===`);

  let updated = 0;
  for (const name of names) {
    const parts = name.split(/\s+/);
    if (parts.length < 2) continue;
    // Son kelime soyad, geri kalanı ad
    const soyad = parts[parts.length - 1];
    const ad = parts.slice(0, -1).join(' ');

    const match = allMembers.find(m =>
      norm(`${m.ad} ${m.soyad}`) === name ||
      (norm(m.ad) === ad && norm(m.soyad) === soyad)
    );

    if (match && match.uyeTipi !== targetType && match.uyeTipi !== 'takim') {
      await sql`UPDATE "Member" SET "uyeTipi" = ${targetType} WHERE id = ${match.id}`;
      updated++;
    }
  }
  console.log(`  ${updated} üye güncellendi`);
  totalUpdated += updated;
}

console.log(`\nToplam ${totalUpdated} üyenin tipi güncellendi.`);

// Özet
const summary = await sql`
  SELECT "uyeTipi", COUNT(*) as count
  FROM "Member"
  GROUP BY "uyeTipi"
  ORDER BY count DESC
`;
console.log('\n--- Üye Tipi Dağılımı ---');
summary.forEach(r => console.log(`  ${r.uyeTipi}: ${r.count}`));

await sql.end();
