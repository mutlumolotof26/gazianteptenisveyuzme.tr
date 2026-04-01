import XLSX from "xlsx";
import https from "https";

const AYTEKIN_PATH = "C:/Users/aytek/OneDrive/Masaüstü/aytekin.xlsx";
const BASE_URL = "https://www.gazianteptenisveyuzme.tr";

function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || "GET",
      headers: options.headers || {},
      timeout: 60000,
    };
    const req = https.request(reqOptions, (res) => {
      let data = "";
      const setCookies = res.headers["set-cookie"] || [];
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data, setCookies }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Zaman aşımı")); });
    if (body) req.write(body);
    req.end();
  });
}

// Excel'den takım TC listesini oku
const wb = XLSX.readFile(AYTEKIN_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(ws, { raw: true });
const rows = rawRows.map(row => { const c = {}; for (const [k,v] of Object.entries(row)) c[k.trim()] = v; return c; });

const takimTCset = new Set();
for (const row of rows) {
  const tc = row["TC"] ? String(row["TC"]).split(".")[0].trim() : null;
  if (tc && tc.length > 5) takimTCset.add(tc);
}
console.log(`Excel'deki takım TC sayısı: ${takimTCset.size}`);

// Login
console.log("Admin girişi...");
const loginBody = JSON.stringify({ email: "admin@gazitenisyuzme.com", password: "admin123" });
const loginResp = await request(`${BASE_URL}/api/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(loginBody) },
}, loginBody);

let sessionCookie = "";
for (const c of loginResp.setCookies) {
  const match = c.match(/admin_session=([^;]+)/);
  if (match) { sessionCookie = `admin_session=${match[1]}`; break; }
}
console.log(`Giriş: ${loginResp.status}`);

// Tüm üyeleri çek
const allResp = await request(`${BASE_URL}/api/members?limit=2000`, {
  method: "GET",
  headers: { "Cookie": sessionCookie },
}, null);

const allMembers = JSON.parse(allResp.body);
console.log(`DB'deki toplam üye: ${allMembers.length}`);

// Takım TC'si olan ama uyeTipi takim olmayan üyeleri bul
const toUpdate = allMembers.filter(m => m.tcKimlik && takimTCset.has(m.tcKimlik) && m.uyeTipi !== "takim");
console.log(`uyeTipi güncellenecek üye sayısı: ${toUpdate.length}`);
toUpdate.forEach(m => console.log(`  - ${m.ad} ${m.soyad} TC:${m.tcKimlik} şu an uyeTipi:${m.uyeTipi}`));

// Hepsini takim yap
let updated = 0;
for (const m of toUpdate) {
  const body = JSON.stringify({ uyeTipi: "takim" });
  const res = await request(`${BASE_URL}/api/members/${m.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body), "Cookie": sessionCookie },
  }, body);
  if (res.status === 200) { updated++; console.log(`  ✓ ${m.ad} ${m.soyad} → takim`); }
  else console.log(`  ✗ ${m.ad} ${m.soyad} HATA: ${res.status}`);
}

console.log(`\nGüncellenen: ${updated}/${toUpdate.length}`);
