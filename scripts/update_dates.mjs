import { readFileSync } from 'fs';
import { createRequire } from 'module';

// --- Config ---
const JSON_PATH = 'C:/Users/aytek/gaziantep-tenisyuzme/scripts/members_import_data.json';
const BASE_URL  = 'https://www.gazianteptenisveyuzme.tr';
const EMAIL     = 'admin@gazitenisyuzme.com';
const PASSWORD  = 'admin123';
const BATCH     = 100;

// --- 1. JSON oku ve updates listesini oluştur ---
console.log('JSON dosyası okunuyor...');
const raw      = readFileSync(JSON_PATH, 'utf-8');
const parsed   = JSON.parse(raw);
const members  = Array.isArray(parsed) ? parsed : (parsed.members ?? Object.values(parsed)[0]);

const updates = members
  .filter(m => m.baslangicTarihi)
  .map(m => ({ tcKimlik: m.tc, kayitTarihi: m.baslangicTarihi }));

console.log(`Toplam üye: ${members.length}`);
console.log(`baslangicTarihi olan üye: ${updates.length}`);

if (updates.length === 0) {
  console.log('Güncellenecek kayıt yok, çıkılıyor.');
  process.exit(0);
}

// --- 2. Login ---
console.log('\nGiriş yapılıyor...');
const loginRes = await fetch(`${BASE_URL}/api/auth`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ email: EMAIL, password: PASSWORD }),
  redirect: 'manual',
});

// Cookie'yi al
const setCookieHeader = loginRes.headers.get('set-cookie') ?? '';
const cookieMatch = setCookieHeader.match(/admin_session=[^;]+/);
if (!cookieMatch) {
  const body = await loginRes.text();
  console.error('Login başarısız! Status:', loginRes.status);
  console.error('Yanıt:', body.slice(0, 500));
  process.exit(1);
}
const sessionCookie = cookieMatch[0];
console.log('Giriş başarılı. Cookie:', sessionCookie.slice(0, 40) + '...');

// --- 3. Batch batch POST ---
const batches    = Math.ceil(updates.length / BATCH);
let successCount = 0;
let failCount    = 0;

for (let i = 0; i < batches; i++) {
  const slice = updates.slice(i * BATCH, (i + 1) * BATCH);
  const label = `Batch ${i + 1}/${batches} (${slice.length} kayıt)`;
  process.stdout.write(`${label} gönderiliyor... `);

  try {
    const res = await fetch(`${BASE_URL}/api/admin/members/bulk-update-dates`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie':        sessionCookie,
      },
      body: JSON.stringify({ updates: slice }),
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (res.ok) {
      const updated = json.updated ?? json.count ?? slice.length;
      successCount += updated;
      console.log(`OK (${res.status}) — güncellenen: ${updated}`);
    } else {
      failCount += slice.length;
      console.error(`HATA (${res.status}):`, text.slice(0, 200));
    }
  } catch (err) {
    failCount += slice.length;
    console.error(`İSTEK HATASI: ${err.message}`);
  }
}

// --- 4. Özet ---
console.log('\n========== ÖZET ==========');
console.log(`Toplam güncelleme denemesi : ${updates.length}`);
console.log(`Başarılı güncelleme        : ${successCount}`);
console.log(`Başarısız                  : ${failCount}`);
console.log('===========================');
