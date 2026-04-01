import pandas as pd
import json
import math
from datetime import datetime, timedelta

AYTEKIN_PATH = r"C:\Users\aytek\OneDrive\Masaüstü\aytekin.xlsx"
HAVUZ_PATH   = r"C:\Users\aytek\OneDrive\Masaüstü\HAVUZ GÜNCEL-DESKTOP-3QR6TMC.xlsx"
OUTPUT_JSON  = r"C:\Users\aytek\gaziantep-tenisyuzme\scripts\members_import_data.json"

EXCEL_EPOCH = datetime(1899, 12, 30)

def excel_serial_to_date(val):
    try:
        n = int(float(val))
        return (EXCEL_EPOCH + timedelta(days=n)).strftime("%Y-%m-%d")
    except Exception:
        return None

def parse_date_flexible(val):
    """Try to parse a date value: Excel serial int OR date string."""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    # If it's already a datetime (pandas may parse it)
    if isinstance(val, (datetime, pd.Timestamp)):
        return pd.Timestamp(val).strftime("%Y-%m-%d")
    # Try numeric (Excel serial)
    try:
        f = float(val)
        if f > 1000:  # plausible serial
            return excel_serial_to_date(int(f))
    except (ValueError, TypeError):
        pass
    # Try string parsing
    try:
        return pd.to_datetime(str(val), dayfirst=True).strftime("%Y-%m-%d")
    except Exception:
        return None

def split_name(full):
    """Split full name into ad (first word) and soyad (rest)."""
    if not isinstance(full, str):
        return None, None
    parts = full.strip().split()
    if not parts:
        return None, None
    ad = parts[0]
    soyad = " ".join(parts[1:]) if len(parts) > 1 else ""
    return ad, soyad

def clean_tc(val):
    """Return TC as 11-char string or None."""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    s = str(val).strip().split(".")[0]  # remove ".0" from float
    if not s or s.lower() in ("nan", "none", ""):
        return None
    # pad/trim to handle edge cases
    return s

def clean_tel(val):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    s = str(val).strip().split(".")[0]
    if not s or s.lower() in ("nan", "none", ""):
        return None
    return s

# ── 1. aytekin.xlsx ──────────────────────────────────────────────────────────
print("=" * 60)
print("aytekin.xlsx okunuyor...")
df_ay = pd.read_excel(AYTEKIN_PATH)
print(f"  Toplam satır: {len(df_ay)}")
print(f"  Sütunlar: {list(df_ay.columns)}")

takim_members = []
skipped_takim = 0

for _, row in df_ay.iterrows():
    full_name = row.get("İSİM SOYİSİM", None)
    ad, soyad = split_name(full_name)
    if not ad:
        skipped_takim += 1
        continue

    tc = clean_tc(row.get("TC", None))
    # TC yoksa yine de ekle (takım için zorunlu değil)

    tel = clean_tel(row.get("TEL", None))

    dt_raw = row.get("D.T", None)
    dogum_tarihi = None
    if dt_raw is not None and not (isinstance(dt_raw, float) and math.isnan(dt_raw)):
        dogum_tarihi = excel_serial_to_date(dt_raw)

    member = {
        "ad": ad,
        "soyad": soyad,
        "uyeTipi": "takim",
        "spor": "yuzme",
    }
    if tc:
        member["tc"] = tc
    if tel:
        member["telefon"] = tel
    if dogum_tarihi:
        member["dogumTarihi"] = dogum_tarihi

    takim_members.append(member)

print(f"  Geçerli takım üyesi: {len(takim_members)}, Atlanan: {skipped_takim}")

# ── 2. HAVUZ GÜNCEL ──────────────────────────────────────────────────────────
print()
print("=" * 60)
print("HAVUZ GÜNCEL okunuyor...")
xl_havuz = pd.ExcelFile(HAVUZ_PATH)
sheets = xl_havuz.sheet_names
print(f"  Sayfalar: {sheets}")

kursiyerler = []
skipped_havuz = 0

for sheet in sheets:
    df_h = pd.read_excel(HAVUZ_PATH, sheet_name=sheet)
    print(f"\n  Sayfa: '{sheet}' — {len(df_h)} satır, sütunlar: {list(df_h.columns)}")

    # Find the right column names (flexible)
    col_map = {}
    for col in df_h.columns:
        col_s = str(col).strip().upper()
        if "ADI" in col_s and "SOYADI" in col_s:
            col_map["isim"] = col
        elif col_s == "TC" or col_s.startswith("TC ") or "KİMLİK" in col_s or col_s == "TC NO":
            col_map["tc"] = col
        elif "TEL" in col_s:
            col_map["tel"] = col
        elif "BAŞLANGIÇ" in col_s or "BASLANGIC" in col_s:
            col_map["baslangic"] = col

    print(f"    Eşleşen sütunlar: {col_map}")

    if "isim" not in col_map:
        print(f"    UYARI: 'ADI SOYADI' sütunu bulunamadı, sayfa atlanıyor.")
        skipped_havuz += len(df_h)
        continue

    for _, row in df_h.iterrows():
        full_name = row.get(col_map["isim"], None)
        ad, soyad = split_name(full_name)
        if not ad:
            skipped_havuz += 1
            continue

        tc_raw = row.get(col_map.get("tc", "__NO_COL__"), None) if "tc" in col_map else None
        tc = clean_tc(tc_raw)
        if not tc:
            skipped_havuz += 1
            continue

        tel_raw = row.get(col_map.get("tel", "__NO_COL__"), None) if "tel" in col_map else None
        tel = clean_tel(tel_raw)

        bas_raw = row.get(col_map.get("baslangic", "__NO_COL__"), None) if "baslangic" in col_map else None
        baslangic = parse_date_flexible(bas_raw)

        member = {
            "ad": ad,
            "soyad": soyad,
            "tc": tc,
            "uyeTipi": "kursiyerler",
            "spor": "yuzme",
            "notlar": sheet,
        }
        if tel:
            member["telefon"] = tel
        if baslangic:
            member["baslangicTarihi"] = baslangic

        kursiyerler.append(member)

print(f"\n  Geçerli kursiyer: {len(kursiyerler)}, Atlanan: {skipped_havuz}")

# ── 3. Deduplicate by TC ─────────────────────────────────────────────────────
print()
print("=" * 60)
print("TC'ye göre tekilleştirme yapılıyor...")

all_members = takim_members + kursiyerler
seen_tc = {}
unique_members = []
dup_count = 0

for m in all_members:
    tc = m["tc"]
    if tc not in seen_tc:
        seen_tc[tc] = True
        unique_members.append(m)
    else:
        dup_count += 1

print(f"  Toplam (ham): {len(all_members)}")
print(f"  Tekrar eden TC (atlandı): {dup_count}")
print(f"  Benzersiz üye: {len(unique_members)}")

# ── 4. Özet ──────────────────────────────────────────────────────────────────
final_takim = [m for m in unique_members if m["uyeTipi"] == "takim"]
final_kursiyer = [m for m in unique_members if m["uyeTipi"] == "kursiyerler"]

print()
print("=" * 60)
print("ÖZET:")
print(f"  Takım üyeleri (yuzme):     {len(final_takim)}")
print(f"  Kursiyerler (yuzme):       {len(final_kursiyer)}")
print(f"  Atlanılan (TC/isim yok):   {skipped_takim + skipped_havuz}")
print(f"  Toplam benzersiz:          {len(unique_members)}")

# ── 5. İlk 5 örnek ───────────────────────────────────────────────────────────
print()
print("=" * 60)
print("İlk 5 TAKIM üyesi:")
for i, m in enumerate(final_takim[:5], 1):
    print(f"  {i}. {json.dumps(m, ensure_ascii=False)}")

print()
print("İlk 5 KURSİYER:")
for i, m in enumerate(final_kursiyer[:5], 1):
    print(f"  {i}. {json.dumps(m, ensure_ascii=False)}")

# ── 6. JSON kaydet ────────────────────────────────────────────────────────────
payload = {"members": unique_members}
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

print()
print("=" * 60)
print(f"Tam veri kaydedildi: {OUTPUT_JSON}")
print(f"POST gövdesi hazır: {len(unique_members)} üye")
