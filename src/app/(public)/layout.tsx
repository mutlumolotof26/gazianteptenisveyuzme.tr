import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { prisma } from "@/lib/db";

async function getSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: 1 } });
  } catch {
    return null;
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  return (
    <>
      <Header
        logoUrl={s?.logoUrl ?? "/logo.png"}
        siteName={s?.siteName ?? "Gaziantep Yüzme Spor Kulübü"}
        siteAcik={s?.siteAcik ?? "Tenis & Yüzme"}
      />
      <main className="min-h-screen">{children}</main>
      <WhatsAppButton phoneNumber={s?.whatsappNo ?? ""} />
      <Footer
        logoUrl={s?.logoUrl ?? "/logo.png"}
        siteName={s?.siteName ?? "Gaziantep Yüzme Spor Kulübü"}
        telefon={s?.telefon ?? "+90 (342) 000 00 00"}
        email={s?.email ?? "info@gazitenisyuzme.com"}
        adres={s?.adres ?? "Şehitkamil, Gaziantep, Türkiye"}
        calismaHafta={s?.calismaHafta ?? "07:00 - 22:00"}
        calismaCumartesi={s?.calismaCumartesi ?? "08:00 - 20:00"}
        calismaPazar={s?.calismaPazar ?? "09:00 - 18:00"}
        instagramUrl={s?.instagramUrl ?? ""}
        facebookUrl={s?.facebookUrl ?? ""}
      />
    </>
  );
}
