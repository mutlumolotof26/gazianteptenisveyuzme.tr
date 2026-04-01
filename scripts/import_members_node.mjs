import XLSX from "xlsx";
import fs from "fs";

const AYTEKIN_PATH = "C:/Users/aytek/OneDrive/Masaüstü/aytekin.xlsx";
const OUTPUT_JSON  = "C:/Users/aytek/gaziantep-tenisyuzme/scripts/members_import_data.json";

function excelSerialToDate(serial) {
  if (!serial || isNaN(serial)) return null;
  const n = Math.floor(Number(serial));
  if (n < 1000) return null;
  const d = new Date(Date.UTC(1899, 11, 30) + n * 86400000);
  return d.toISOString().split("T")[0];
}

function parseDate(val) {
  if (val == null) return null;
  if (val instanceof Date) return val.toISOString().split("T")[0];
  const n = Number(val);
  if (!isNaN(n) && n > 1000) return excelSerialToDate(n);
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return null;
}

function cleanTC(val) {
  if (val == null) return null;
  const s = String(val).split(".")[0].trim();
  if (!s || s.toLowerCase() === "nan" || s.toLowerCase() === "null") return null;
  return s;
}

function cleanTel(val) {
  if (val == null) return null;
  const s = String(val).split(".")[0].trim();
  if (!s || s.toLowerCase() === "nan") return null;
  return s;
}

function splitName(full) {
  if (!full || typeof full !== "string") return [null, null];
  const parts = full.trim().split(/\s+/);
  if (!parts.length) return [null, null];
  return [parts[0], parts.slice(1).join(" ")];
}

// ── aytekin.xlsx ──
console.log("aytekin.xlsx okunuyor:", AYTEKIN_PATH);
const wb = XLSX.readFile(AYTEKIN_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(ws, { raw: true });
// Sütun adlarındaki baştaki/sondaki boşlukları temizle
const rows = rawRows.map(row => {
  const clean = {};
  for (const [k, v] of Object.entries(row)) clean[k.trim()] = v;
  return clean;
});
console.log(`  Toplam satır: ${rows.length}`);
console.log(`  Örnek satır anahtarları:`, Object.keys(rows[0] || {}));

const takimMembers = [];
let skipped = 0;

for (const row of rows) {
  const fullName = row["İSİM SOYİSİM"] || row["ISIM SOYISIM"] || row["Ad Soyad"] || row["ADI SOYADI"];
  const [ad, soyad] = splitName(fullName);
  if (!ad) { skipped++; continue; }

  const tc = cleanTC(row["TC"] || row["TC NO"] || row["TC KİMLİK"]);
  const tel = cleanTel(row["TEL"] || row["TELEFON"]);
  const dogumTarihi = parseDate(row["D.T"] || row["DOĞUM TARİHİ"] || row["DOGUM TARIHI"]);

  const member = { ad, soyad, uyeTipi: "takim", spor: "yuzme" };
  if (tc) member.tcKimlik = tc;
  if (tel) member.telefon = tel;
  if (dogumTarihi) member.dogumTarihi = dogumTarihi;

  takimMembers.push(member);
}

console.log(`  Geçerli takım üyesi: ${takimMembers.length}, Atlanan: ${skipped}`);

// Mevcut JSON'daki kursiyerleri koru
let existingKursiyerler = [];
if (fs.existsSync(OUTPUT_JSON)) {
  const existing = JSON.parse(fs.readFileSync(OUTPUT_JSON, "utf8"));
  existingKursiyerler = (existing.members || []).filter(m => m.uyeTipi === "kursiyerler");
  console.log(`Mevcut JSON'dan ${existingKursiyerler.length} kursiyer korunuyor`);
}

const allMembers = [...takimMembers, ...existingKursiyerler];
const payload = { members: allMembers };
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2), "utf8");

console.log(`\nJSON kaydedildi: ${OUTPUT_JSON}`);
console.log(`Toplam: ${allMembers.length} (Takım: ${takimMembers.length}, Kursiyer: ${existingKursiyerler.length})`);

// İlk 5 takım üyesi
console.log("\nİlk 5 takım üyesi:");
takimMembers.slice(0, 5).forEach((m, i) => console.log(`  ${i+1}. ${m.ad} ${m.soyad} TC:${m.tcKimlik || "YOK"}`));
