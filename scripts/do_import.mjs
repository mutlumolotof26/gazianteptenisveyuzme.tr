import fs from "fs";
import https from "https";

const JSON_FILE = "C:/Users/aytek/gaziantep-tenisyuzme/scripts/members_import_data.json";
const BASE_URL = "https://www.gazianteptenisveyuzme.tr";
const BATCH_SIZE = 50;

// ─── HTTP yardımcı fonksiyon ───────────────────────────────────────────────
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

// ─── Üye normalize et: 'tc' -> 'tcKimlik' ────────────────────────────────
function normalize(m) {
  const out = { ad: m.ad || "", soyad: m.soyad || "" };
  const tc = m.tcKimlik || m.tc;
  if (tc) out.tcKimlik = String(tc);
  if (m.telefon) out.telefon = String(m.telefon);
  if (m.dogumTarihi) out.dogumTarihi = m.dogumTarihi;
  out.uyeTipi = m.uyeTipi || "standart";
  if (m.spor) out.spor = m.spor;
  if (m.notlar) out.notlar = m.notlar;
  return out;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  // 1. JSON oku
  console.log(`JSON dosyası okunuyor: ${JSON_FILE}`);
  const raw = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
  const rawMembers = raw.members || raw;
  const members = rawMembers.map(normalize);
  console.log(`Toplam ${members.length} üye bulundu.\n`);

  // 2. Login
  console.log("Admin girişi yapılıyor...");
  const loginBody = JSON.stringify({ email: "admin@gazitenisyuzme.com", password: "admin123" });
  const loginResp = await request(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(loginBody),
    },
  }, loginBody);

  console.log(`Login yanıtı: ${loginResp.status} - ${loginResp.body.slice(0, 200)}`);

  if (loginResp.status !== 200) {
    console.error("HATA: Giriş başarısız!");
    process.exit(1);
  }

  // Cookie'yi al
  let sessionCookie = "";
  for (const c of loginResp.setCookies) {
    const match = c.match(/admin_session=([^;]+)/);
    if (match) {
      sessionCookie = `admin_session=${match[1]}`;
      break;
    }
  }

  if (!sessionCookie) {
    console.warn("UYARI: admin_session cookie bulunamadı!");
    console.log("Set-Cookie headers:", loginResp.setCookies);
    // Devam etmeyi dene
  } else {
    console.log("Oturum cookie'si alındı: admin_session\n");
  }

  // 3. Batch'ler halinde import
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = [];
  let batchNum = 0;

  for (let i = 0; i < members.length; i += BATCH_SIZE) {
    const batch = members.slice(i, i + BATCH_SIZE);
    batchNum++;
    const start = i + 1;
    const end = i + batch.length;
    process.stdout.write(`Batch ${batchNum}: ${start}-${end} arası ${batch.length} üye gönderiliyor... `);

    const bodyStr = JSON.stringify({ members: batch });

    try {
      const resp = await request(`${BASE_URL}/api/admin/members/bulk-import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
          "Cookie": sessionCookie,
        },
      }, bodyStr);

      if (resp.status === 200) {
        let result;
        try {
          result = JSON.parse(resp.body);
        } catch {
          console.log(`\n  HATA: JSON parse hatası. Yanıt: ${resp.body.slice(0, 200)}`);
          totalSkipped += batch.length;
          continue;
        }
        const added = result.added || 0;
        const skipped = result.skipped || 0;
        const errors = result.errors || [];
        totalAdded += added;
        totalSkipped += skipped;
        totalErrors.push(...errors);
        console.log(`Eklendi: ${added} | Atlandı: ${skipped} | Hata: ${errors.length}`);
        if (errors.length > 0) {
          errors.slice(0, 3).forEach((e) => console.log(`    - ${e}`));
          if (errors.length > 3) console.log(`    ... ve ${errors.length - 3} hata daha`);
        }
      } else if (resp.status === 401) {
        console.log(`\n  HATA: Yetkisiz erişim (401).`);
        console.log(`  Yanıt: ${resp.body.slice(0, 300)}`);
        break;
      } else {
        console.log(`\n  HATA: HTTP ${resp.status}`);
        console.log(`  Yanıt: ${resp.body.slice(0, 300)}`);
        totalSkipped += batch.length;
      }
    } catch (err) {
      console.log(`\n  HATA: ${err.message}`);
      totalSkipped += batch.length;
    }

    await sleep(300);
  }

  // 4. Özet
  console.log("\n" + "=".repeat(50));
  console.log("IMPORT TAMAMLANDI");
  console.log("=".repeat(50));
  console.log(`Toplam Eklenen : ${totalAdded}`);
  console.log(`Toplam Atlanan : ${totalSkipped}`);
  console.log(`Toplam Hata    : ${totalErrors.length}`);
  if (totalErrors.length > 0) {
    console.log("\nHata listesi:");
    totalErrors.forEach((e) => console.log(`  - ${e}`));
  }
}

main().catch((err) => {
  console.error("Beklenmeyen hata:", err);
  process.exit(1);
});
