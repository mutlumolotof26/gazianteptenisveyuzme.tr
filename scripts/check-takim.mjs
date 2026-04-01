import postgres from 'postgres';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const dbUrl = envFile.match(/DATABASE_URL="([^"]+)"/)?.[1];
const sql = postgres(dbUrl, { ssl: 'require' });

const takimlar = await sql`SELECT id, ad, soyad, "uyeTipi", spor, durum FROM "Member" WHERE "uyeTipi" = 'takim' LIMIT 20`;
console.log('Takım üyeleri:', takimlar.length);
takimlar.forEach(m => console.log(`  ${m.ad} ${m.soyad} | uyeTipi=${m.uyeTipi} | spor=${m.spor} | durum=${m.durum}`));

const aidatCheck = await sql`
  SELECT m.ad, m.soyad, COUNT(a.id) as aidat_sayisi
  FROM "Member" m
  LEFT JOIN "Aidat" a ON a."memberId" = m.id
  WHERE m."uyeTipi" = 'takim'
  GROUP BY m.id, m.ad, m.soyad
  LIMIT 10
`;
console.log('\nTakım aidat kontrol:');
aidatCheck.forEach(r => console.log(`  ${r.ad} ${r.soyad} → ${r.aidat_sayisi} aidat kaydı`));

await sql.end();
