/**
 * Geçmiş dönemlerdeki (bugünden önceki) tüm aidatları odendi=true yapar.
 * node scripts/mark-gecmis-odendi.mjs
 */
import postgres from 'postgres';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const dbUrl = envFile.match(/DATABASE_URL="([^"]+)"/)?.[1];
const sql = postgres(dbUrl, { ssl: 'require' });

const now = new Date();
const currentDonem = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
console.log(`📅 Mevcut dönem: ${currentDonem}`);
console.log(`⏳ Bu dönemden önceki tüm aidatlar ödendi yapılacak...\n`);

// Önce kaç kayıt etkileneceğini göster
const preview = await sql`
  SELECT donem, COUNT(*) as adet, SUM(tutar) as toplam
  FROM "Aidat"
  WHERE donem < ${currentDonem} AND odendi = false AND tutar > 0
  GROUP BY donem
  ORDER BY donem
`;

console.log('Etkilenecek dönemler:');
let toplamAdet = 0;
let toplamTutar = 0;
for (const r of preview) {
  console.log(`  ${r.donem}: ${r.adet} kayıt, ${Number(r.toplam).toLocaleString('tr-TR')}₺`);
  toplamAdet += Number(r.adet);
  toplamTutar += Number(r.toplam);
}
console.log(`\nToplam: ${toplamAdet} kayıt, ${toplamTutar.toLocaleString('tr-TR')}₺\n`);

if (toplamAdet === 0) {
  console.log('✅ Güncellenecek kayıt yok.');
  await sql.end(); process.exit(0);
}

// Güncelle: dönem sonunun son günü ödeme tarihi olarak ayarla
const result = await sql`
  UPDATE "Aidat"
  SET
    odendi = true,
    "odemeTarihi" = (
      to_date(donem, 'YYYY-MM') + interval '1 month - 1 day'
    ),
    "updatedAt" = NOW()
  WHERE donem < ${currentDonem}
    AND odendi = false
    AND tutar > 0
`;

console.log(`✅ ${result.count} aidat kaydı "ödendi" olarak güncellendi.`);

// Özet
const ozet = await sql`
  SELECT
    COUNT(*) FILTER (WHERE odendi = true) as odendi,
    COUNT(*) FILTER (WHERE odendi = false AND tutar > 0) as odenmedi,
    COUNT(*) FILTER (WHERE tutar = 0) as tutarsiz
  FROM "Aidat"
`;
console.log('\n📊 Güncel aidat durumu:');
console.log(`  ✅ Ödendi:    ${ozet[0].odendi}`);
console.log(`  ❌ Ödenmedi:  ${ozet[0].odenmedi}`);
console.log(`  ➖ Tutar yok: ${ozet[0].tutarsiz}`);

await sql.end();
