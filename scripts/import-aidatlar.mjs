/**
 * Excel'den üye ve aidat verilerini toplu olarak veritabanına aktarır.
 * node scripts/import-aidatlar.mjs
 */

import xlsx from 'xlsx';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const dbUrl = envFile.match(/DATABASE_URL="([^"]+)"/)?.[1];
if (!dbUrl) { console.error('DATABASE_URL bulunamadı'); process.exit(1); }

const sql = postgres(dbUrl, { ssl: 'require', max: 5 });

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
function excelSerial(val) {
  if (typeof val === 'number' && val > 40000 && val < 50000)
    return new Date(Math.round((val - 25569) * 86400 * 1000));
  if (typeof val === 'string') {
    const m = val.match(/^(\d{1,2})\.(\d{1,2})/);
    if (m) { const [,d,mo] = m.map(Number); return new Date(mo>=8?2024:2025, mo-1, d); }
  }
  return null;
}
function getDonem(v) {
  const d = excelSerial(v); if (!d) return null;
  const y = d.getFullYear(); if (y<2020||y>2030) return null;
  return `${y}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function parseFee(v) {
  if (typeof v==='number' && v>0 && v<100000) return v;
  if (typeof v==='string') { const n=parseInt(v.replace(/[^0-9]/g,'')); return(!isNaN(n)&&n>0&&n<100000)?n:null; }
  return null;
}
function cleanPhone(v) {
  if (!v) return null; const s=String(v).replace(/[^0-9]/g,''); return s.length>=10?s.slice(-10):null;
}
function cleanTC(v) {
  if (!v) return null; const s=String(v).replace(/[^0-9]/g,''); return s.length===11?s:null;
}
function splitName(fullName) {
  if (!fullName||typeof fullName!=='string') return null;
  const parts=fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length<2) return null;
  const soyad=parts.pop(); return {ad:parts.join(' '),soyad};
}
function genId() { return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,9); }

const CONFIGS = {
  'C.TESİ-PAZAR':              {startRow:2,  nameCol:1, tcCol:2,    feeCol:4, telCol:5, dateCol:6},
  'BİREY 11.00-12.00':         {startRow:1,  nameCol:1, tcCol:2,    feeCol:4, telCol:5, dateCol:6},
  'YETİŞKİN ERKEK ':           {startRow:1,  nameCol:1, tcCol:null, feeCol:6, telCol:7, dateCol:4},
  'SALI-PERŞEMBE 09.00-10.00': {startRow:0,  nameCol:1, tcCol:2,    feeCol:4, telCol:7, dateCol:5},
  'YETİŞKİN BAYAN ':           {startRow:1,  nameCol:1, tcCol:null, feeCol:6, telCol:7, dateCol:4},
  'ÇARŞAMBA-CUMA 16.00-17.00': {startRow:0,  nameCol:1, tcCol:2,    feeCol:4, telCol:7, dateCol:5},
  'SALI-PERŞEMBE 16.00-17.00': {startRow:0,  nameCol:1, tcCol:2,    feeCol:3, telCol:7, dateCol:5},
};
const SKIP = /HESAP|KAYIT|DEVAM|TOPLAM|ADI SOYADI|İSİM SOYİSİM/i;

function parseExcel(filePath) {
  const wb = xlsx.readFile(filePath);
  const records = [];
  for (const sn of wb.SheetNames) {
    const cfg = CONFIGS[sn]; if (!cfg) continue;
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sn], {header:1, defval:null});
    for (let i=cfg.startRow; i<data.length; i++) {
      const row=data[i]; if (!row||row.every(c=>c===null)) continue;
      const rawName=row[cfg.nameCol];
      if (!rawName||typeof rawName!=='string') continue;
      const name=rawName.trim();
      if (name.length<4||SKIP.test(name)) continue;
      const np=splitName(name); if (!np) continue;
      records.push({
        ad:   np.ad.toUpperCase().trim(),
        soyad:np.soyad.toUpperCase().trim(),
        tc:   cleanTC(cfg.tcCol!=null?row[cfg.tcCol]:null),
        tel:  cleanPhone(row[cfg.telCol]),
        fee:  parseFee(row[cfg.feeCol]),
        donem:getDonem(row[cfg.dateCol]),
        grup: sn.trim(),
      });
    }
  }
  return records;
}

async function main() {
  console.log('📂 Excel okunuyor...');
  const records = parseExcel('C:/Users/aytek/OneDrive/Masaüstü/HAVUZ GÜNCEL-DESKTOP-3QR6TMC.xlsx');
  console.log(`✅ ${records.length} satır parse edildi\n`);

  // ── Mevcut üyeleri belleğe al ──────────────────────────────────────────────
  console.log('🔌 Veritabanı bağlantısı...');
  const existingMembers = await sql`SELECT id, ad, soyad, "tcKimlik" FROM "Member"`;
  const byTC   = new Map(existingMembers.filter(m=>m.tcKimlik).map(m=>[m.tcKimlik, m.id]));
  const byName = new Map(existingMembers.map(m=>[`${m.ad.trim().toUpperCase()}||${m.soyad.trim().toUpperCase()}`, m.id]));
  console.log(`✅ ${existingMembers.length} mevcut üye yüklendi`);

  // ── Yeni üyeleri topla ────────────────────────────────────────────────────
  const newMembers = []; // {id, ad, soyad, tc, tel, grup}
  const memberIdFor = (rec) => {
    if (rec.tc && byTC.has(rec.tc)) return byTC.get(rec.tc);
    const key = `${rec.ad}||${rec.soyad}`;
    if (byName.has(key)) return byName.get(key);
    return null;
  };

  for (const rec of records) {
    if (!memberIdFor(rec)) {
      const key = `${rec.ad}||${rec.soyad}`;
      if (!byName.has(key)) { // Tekrar eklememek için
        const id = genId();
        newMembers.push({id, ad:rec.ad, soyad:rec.soyad, tc:rec.tc??null, tel:rec.tel??null, grup:rec.grup});
        byName.set(key, id);
        if (rec.tc) byTC.set(rec.tc, id);
      }
    }
  }
  console.log(`📝 ${newMembers.length} yeni üye eklenecek`);

  // ── Yeni üyeleri toplu ekle ────────────────────────────────────────────────
  const now = new Date();
  if (newMembers.length > 0) {
    const CHUNK = 50;
    for (let i=0; i<newMembers.length; i+=CHUNK) {
      const chunk = newMembers.slice(i, i+CHUNK);
      for (const m of chunk) {
        await sql`
          INSERT INTO "Member" (id, ad, soyad, "tcKimlik", telefon, "uyeTipi", spor, durum, "kayitTarihi", notlar, "updatedAt")
          VALUES (${m.id}, ${m.ad}, ${m.soyad}, ${m.tc}, ${m.tel}, 'standart', 'yuzme', 'aktif', ${now}, ${'Excel aktarımı - ' + m.grup}, ${now})
          ON CONFLICT DO NOTHING
        `;
      }
      process.stdout.write(`\r  Üye ekleniyor: ${Math.min(i+CHUNK, newMembers.length)}/${newMembers.length}`);
    }
    console.log('\n✅ Üyeler eklendi');
  }

  // ── Mevcut aidatları belleğe al ────────────────────────────────────────────
  const existingAidatlar = await sql`SELECT "memberId", donem FROM "Aidat"`;
  const aidatSet = new Set(existingAidatlar.map(a=>`${a.memberId}||${a.donem}`));
  console.log(`✅ ${existingAidatlar.length} mevcut aidat yüklendi`);

  // ── Yeni aidatları topla ──────────────────────────────────────────────────
  const newAidatlar = [];
  for (const rec of records) {
    if (!rec.fee || !rec.donem) continue;
    const memberId = memberIdFor(rec); if (!memberId) continue;
    const key = `${memberId}||${rec.donem}`;
    if (aidatSet.has(key)) continue;
    aidatSet.add(key); // Tekrar eklememek için
    newAidatlar.push({
      id: genId(), memberId, donem: rec.donem,
      tutar: rec.fee, grup: rec.grup
    });
  }
  console.log(`💰 ${newAidatlar.length} yeni aidat eklenecek`);

  // ── Yeni aidatları toplu ekle ─────────────────────────────────────────────
  if (newAidatlar.length > 0) {
    const CHUNK = 100;
    for (let i=0; i<newAidatlar.length; i+=CHUNK) {
      const chunk = newAidatlar.slice(i, i+CHUNK);
      for (const a of chunk) {
        await sql`
          INSERT INTO "Aidat" (id, "memberId", donem, tutar, odendi, "odemeTarihi", notlar, "createdAt", "updatedAt")
          VALUES (${a.id}, ${a.memberId}, ${a.donem}, ${a.tutar}, false, null, ${'Grup: ' + a.grup}, ${now}, ${now})
          ON CONFLICT DO NOTHING
        `;
      }
      process.stdout.write(`\r  Aidat ekleniyor: ${Math.min(i+CHUNK, newAidatlar.length)}/${newAidatlar.length}`);
    }
    console.log('\n✅ Aidatlar eklendi');
  }

  await sql.end();

  const withFee   = records.filter(r=>r.fee&&r.donem).length;
  const noFee     = records.length - withFee;
  const duplicate = records.filter(r=>r.fee&&r.donem).length - newAidatlar.length;

  console.log('\n╔═══════════════════════════════╗');
  console.log('║           SONUÇ               ║');
  console.log('╠═══════════════════════════════╣');
  console.log(`║ 👤 Yeni üye eklendi:   ${String(newMembers.length).padStart(5)}  ║`);
  console.log(`║ 👤 Mevcut üye sayısı:  ${String(existingMembers.length).padStart(5)}  ║`);
  console.log(`║ 💰 Yeni aidat eklendi: ${String(newAidatlar.length).padStart(5)}  ║`);
  console.log(`║ ⏭️  Zaten mevcuttu:    ${String(duplicate).padStart(5)}  ║`);
  console.log(`║ ➖ Ücret/dönem yok:   ${String(noFee).padStart(5)}  ║`);
  console.log('╚═══════════════════════════════╝');
}

main().catch(err => { console.error('HATA:', err.message); process.exit(1); });
