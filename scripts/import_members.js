// import_members.js — Node.js version
// Requires: xlsx (npm install xlsx)
//
// Sheet structures in HAVUZ GÜNCEL:
//   C.TESİ-PAZAR         : row 0 = title, row 1 = header (ADI SOYADI, TC, GÜN, ÜÇRET, TEL, BAŞLANGIÇ T, BİTİŞ T)
//   BİREY 11.00-12.00    : row 0 = header (ADI SOYADI, TC, GÜN, ÜÇRET, TEL, BAŞLANGIÇ T, BİTİŞ T)
//   YETİŞKİN ERKEK       : row 0 = header (İSİM SOYİSİM, GÜN, BAŞLANGIÇ T, BİTİŞ TARİHİ, ÖDEME, TEL) — NO TC
//   YETİŞKİN BAYAN       : same as YETİŞKİN ERKEK — NO TC
//   SALI-PERŞEMBE 09.00-10.00 : NO header, positional (0=no, 1=isim, 2=tc, 3=gün, 4=ücret, 5=başlangıç, 6=bitiş, 7=tel)
//   ÇARŞAMBA-CUMA 16.00-17.00 : same positional layout
//   SALI-PERŞEMBE 16.00-17.00 : NO header, positional (0=no, 1=isim, 2=tc, 3=ücret, 4=gün, 5=başlangıç, 6=bitiş, 7=tel)

const XLSX = require("xlsx");
const fs   = require("fs");
const path = require("path");

const AYTEKIN_PATH = "C:/Users/aytek/OneDrive/Masaüstü/aytekin.xlsx";
const HAVUZ_PATH   = "C:/Users/aytek/OneDrive/Masaüstü/HAVUZ GÜNCEL-DESKTOP-3QR6TMC.xlsx";
const OUTPUT_JSON  = path.join(__dirname, "members_import_data.json");

const EXCEL_EPOCH = new Date(1899, 11, 30); // Dec 30, 1899

function excelSerialToDate(val) {
  try {
    const n = Math.floor(Number(val));
    if (!isFinite(n) || n < 1) return null;
    const d = new Date(EXCEL_EPOCH.getTime() + n * 86400000);
    return d.toISOString().slice(0, 10);
  } catch { return null; }
}

function parseDateFlexible(val) {
  if (val == null || val === "" || val !== val) return null;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  if (typeof val === "number" && val > 1000) return excelSerialToDate(val);
  const s = String(val).trim();
  if (!s || s.toLowerCase() === "nan") return null;
  // Try ISO / standard parse
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  // DD.MM.YYYY or DD/MM/YYYY
  const m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (m) {
    const d2 = new Date(`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`);
    if (!isNaN(d2.getTime())) return d2.toISOString().slice(0, 10);
  }
  return null;
}

function splitName(full) {
  if (typeof full !== "string" || !full.trim()) return [null, null];
  const parts = full.trim().split(/\s+/);
  return [parts[0], parts.slice(1).join(" ")];
}

function cleanTC(val) {
  if (val == null || val !== val) return null;
  let s = String(val).trim().replace(/\.0+$/, "");
  if (!s || ["nan","none",""].includes(s.toLowerCase())) return null;
  return s;
}

function cleanTel(val) {
  if (val == null || val !== val) return null;
  let s = String(val).trim().replace(/\.0+$/, "");
  if (!s || ["nan","none",""].includes(s.toLowerCase())) return null;
  return s;
}

// Normalize column name: trim whitespace for matching
function normalizeColName(c) {
  return String(c).trim().toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. aytekin.xlsx  (columns have trailing spaces → trim for lookup)
// ─────────────────────────────────────────────────────────────────────────────
console.log("=".repeat(60));
console.log("aytekin.xlsx okunuyor...");

const wbAy = XLSX.readFile(AYTEKIN_PATH, { cellDates: false });
const wsAy = wbAy.Sheets[wbAy.SheetNames[0]];
const rawRowsAy = XLSX.utils.sheet_to_json(wsAy, { defval: null });

// Build a trimmed-key row view
const rowsAy = rawRowsAy.map(row => {
  const r = {};
  for (const [k,v] of Object.entries(row)) r[k.trim()] = v;
  return r;
});

console.log(`  Toplam satır: ${rowsAy.length}`);
if (rowsAy.length > 0) console.log(`  Sütunlar (trimmed): ${Object.keys(rowsAy[0]).join(", ")}`);

const takimMembers = [];
let skippedTakim = 0;

for (const row of rowsAy) {
  const fullName = row["İSİM SOYİSİM"] ?? null;
  const [ad, soyad] = splitName(fullName);
  if (!ad) { skippedTakim++; continue; }

  const tc = cleanTC(row["TC"]);
  if (!tc) { skippedTakim++; continue; }

  const tel         = cleanTel(row["TEL"]);
  const dtRaw       = row["D.T"];
  const dogumTarihi = (dtRaw != null && dtRaw === dtRaw) ? excelSerialToDate(dtRaw) : null;

  const member = { ad, soyad, tc, uyeTipi: "takim", spor: "yuzme" };
  if (tel)         member.telefon     = tel;
  if (dogumTarihi) member.dogumTarihi = dogumTarihi;
  takimMembers.push(member);
}

console.log(`  Geçerli takım üyesi: ${takimMembers.length}, Atlanan: ${skippedTakim}`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. HAVUZ GÜNCEL — per-sheet handling
// ─────────────────────────────────────────────────────────────────────────────
console.log();
console.log("=".repeat(60));
console.log("HAVUZ GÜNCEL okunuyor...");

const wbH  = XLSX.readFile(HAVUZ_PATH, { cellDates: false });
const sheets = wbH.SheetNames;
console.log(`  Sayfalar: ${sheets.join(", ")}`);

const kursiyerler = [];
let skippedHavuz  = 0;

for (const sheet of sheets) {
  const wsH = wbH.Sheets[sheet];
  // Read as array-of-arrays for full control
  const raw = XLSX.utils.sheet_to_json(wsH, { defval: null, header: 1 });

  console.log(`\n  Sayfa: '${sheet}' — ${raw.length} satır`);
  if (raw.length === 0) continue;

  const sheetKey = sheet.trim().toUpperCase();

  // ── Helper: build member from positional row ─────────────────────────────
  // Layout A: [no, isim, tc, gün, ücret, başlangıç, bitiş, tel]  (SP 09, ÇARŞ 16)
  // Layout B: [no, isim, tc, ücret, gün, başlangıç, bitiş, tel]  (SP 16)
  function fromPositionalA(row) {
    const isim = row[1]; const tc = cleanTC(row[2]);
    const bas  = parseDateFlexible(row[5]);
    const tel  = cleanTel(row[7]);
    return { isim, tc, bas, tel };
  }
  function fromPositionalB(row) {
    const isim = row[1]; const tc = cleanTC(row[2]);
    const bas  = parseDateFlexible(row[5]);
    const tel  = cleanTel(row[7]);
    return { isim, tc, bas, tel };
  }

  // ── Helper: build member from header-based rows ──────────────────────────
  function fromHeaderRows(rows, headerRowIndex) {
    const headerRow = rows[headerRowIndex];
    // Build column index map (trimmed)
    const colIdx = {};
    headerRow.forEach((c, i) => {
      if (c == null) return;
      const key = String(c).trim().toUpperCase();
      colIdx[key] = i;
    });
    console.log(`    Header sütunlar: ${JSON.stringify(colIdx)}`);

    const members = [];
    let skipped = 0;
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      // Find isim column (ADI SOYADI or İSİM SOYİSİM variants)
      const isimIdx = colIdx["ADI SOYADI"] ?? colIdx["İSİM SOYİSİM"] ??
                      Object.entries(colIdx).find(([k]) => k.includes("ADI") || k.includes("İSİM"))?.[1] ?? null;
      if (isimIdx === null) { skipped++; continue; }

      const isimVal = row[isimIdx];
      const [ad, soyad] = splitName(isimVal);
      if (!ad) { skipped++; continue; }

      // TC
      const tcIdx = colIdx["TC"] ?? colIdx["TC NO"] ?? null;
      const tc = tcIdx !== null ? cleanTC(row[tcIdx]) : null;
      if (!tc) { skipped++; continue; }

      // TEL
      const telIdx = colIdx["TEL"] ?? Object.entries(colIdx).find(([k]) => k.includes("TEL"))?.[1] ?? null;
      const tel = telIdx !== null ? cleanTel(row[telIdx]) : null;

      // BAŞLANGIÇ
      const basIdx = colIdx["BAŞLANGIÇ T"] ?? colIdx["BAŞLANGIÇ TARİHİ"] ??
                     Object.entries(colIdx).find(([k]) => k.includes("BAŞLANGI"))?.[1] ?? null;
      const bas = basIdx !== null ? parseDateFlexible(row[basIdx]) : null;

      members.push({ ad, soyad, tc, tel, bas });
    }
    return { members, skipped };
  }

  let sheetMembers = [];
  let sheetSkipped = 0;

  if (sheetKey === "C.TESİ-PAZAR") {
    // Row 0 = title, Row 1 = header
    const { members, skipped } = fromHeaderRows(raw, 1);
    sheetMembers = members; sheetSkipped = skipped;

  } else if (sheetKey.startsWith("BİREY")) {
    // Row 0 = header
    const { members, skipped } = fromHeaderRows(raw, 0);
    sheetMembers = members; sheetSkipped = skipped;

  } else if (sheetKey.startsWith("YETİŞKİN")) {
    // Row 0 = header, BUT no TC column → skip entirely (cannot import without TC)
    console.log(`    Bu sayfa TC içermiyor → atlanıyor.`);
    sheetSkipped = raw.length;

  } else if (sheetKey.startsWith("SALI-PERŞEMBE 16") || sheetKey.startsWith("SALI-PERŞEMBE 16")) {
    // Layout B: no=0, isim=1, tc=2, ücret=3, gün=4, başlangıç=5, bitiş=6, tel=7
    console.log(`    Pozisyonel okuma (Layout B)`);
    for (const row of raw) {
      if (!row[1]) { sheetSkipped++; continue; }
      const { isim, tc, bas, tel } = fromPositionalB(row);
      const [ad, soyad] = splitName(isim);
      if (!ad || !tc) { sheetSkipped++; continue; }
      sheetMembers.push({ ad, soyad, tc, tel, bas });
    }

  } else {
    // SALI-PERŞEMBE 09, ÇARŞAMBA-CUMA 16: Layout A
    // no=0, isim=1, tc=2, gün=3, ücret=4, başlangıç=5, bitiş=6, tel=7
    console.log(`    Pozisyonel okuma (Layout A)`);
    for (const row of raw) {
      if (!row[1]) { sheetSkipped++; continue; }
      const { isim, tc, bas, tel } = fromPositionalA(row);
      const [ad, soyad] = splitName(isim);
      if (!ad || !tc) { sheetSkipped++; continue; }
      sheetMembers.push({ ad, soyad, tc, tel, bas });
    }
  }

  console.log(`    Geçerli: ${sheetMembers.length}, Atlanan: ${sheetSkipped}`);

  for (const m of sheetMembers) {
    const member = {
      ad: m.ad, soyad: m.soyad, tc: m.tc,
      uyeTipi: "kursiyerler", spor: "yuzme", notlar: sheet,
    };
    if (m.tel) member.telefon       = m.tel;
    if (m.bas) member.baslangicTarihi = m.bas;
    kursiyerler.push(member);
  }
  skippedHavuz += sheetSkipped;
}

console.log(`\n  Toplam geçerli kursiyer: ${kursiyerler.length}, Toplam atlanan: ${skippedHavuz}`);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Deduplicate by TC
// ─────────────────────────────────────────────────────────────────────────────
console.log();
console.log("=".repeat(60));
console.log("TC'ye göre tekilleştirme yapılıyor...");

const allMembers   = [...takimMembers, ...kursiyerler];
const seenTC       = new Set();
const uniqueMembers = [];
let dupCount = 0;

for (const m of allMembers) {
  if (!seenTC.has(m.tc)) {
    seenTC.add(m.tc);
    uniqueMembers.push(m);
  } else {
    dupCount++;
  }
}

console.log(`  Toplam (ham): ${allMembers.length}`);
console.log(`  Tekrar eden TC (atlandı): ${dupCount}`);
console.log(`  Benzersiz üye: ${uniqueMembers.length}`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Özet
// ─────────────────────────────────────────────────────────────────────────────
const finalTakim    = uniqueMembers.filter(m => m.uyeTipi === "takim");
const finalKursiyer = uniqueMembers.filter(m => m.uyeTipi === "kursiyerler");

console.log();
console.log("=".repeat(60));
console.log("ÖZET:");
console.log(`  Takım üyeleri (yuzme):     ${finalTakim.length}`);
console.log(`  Kursiyerler (yuzme):       ${finalKursiyer.length}`);
console.log(`  Atlanılan (TC/isim yok):   ${skippedTakim + skippedHavuz}`);
console.log(`  Toplam benzersiz:          ${uniqueMembers.length}`);

// ─────────────────────────────────────────────────────────────────────────────
// 5. İlk 5 örnek
// ─────────────────────────────────────────────────────────────────────────────
console.log();
console.log("=".repeat(60));
console.log("İlk 5 TAKIM üyesi:");
finalTakim.slice(0, 5).forEach((m, i) =>
  console.log(`  ${i+1}. ${JSON.stringify(m, null, 0)}`));

console.log();
console.log("İlk 5 KURSİYER:");
finalKursiyer.slice(0, 5).forEach((m, i) =>
  console.log(`  ${i+1}. ${JSON.stringify(m, null, 0)}`));

// ─────────────────────────────────────────────────────────────────────────────
// 6. JSON kaydet
// ─────────────────────────────────────────────────────────────────────────────
const payload = { members: uniqueMembers };
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2), "utf-8");

console.log();
console.log("=".repeat(60));
console.log(`Tam veri kaydedildi: ${OUTPUT_JSON}`);
console.log(`POST gövdesi hazır: ${uniqueMembers.length} üye`);
