import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MessageSquare, Mail, Phone, Clock } from "lucide-react";

export default async function MesajlarPage() {
  await requireAdmin();

  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });

  // Okunmamış mesajları okundu yap
  await prisma.contact.updateMany({ where: { okundu: false }, data: { okundu: true } });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mesajlar</h1>
        <p className="text-gray-500 text-sm">{contacts.length} mesaj</p>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare size={64} className="mx-auto mb-4 opacity-40" />
          <p>Henüz mesaj bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-800">{contact.ad}</div>
                  {contact.konu && <div className="text-sm text-gray-500 font-medium mt-0.5">{contact.konu}</div>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={12} />
                  {new Date(contact.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{contact.mesaj}</p>
              <div className="flex items-center gap-4 text-sm">
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-[#3a8fbf] hover:underline">
                  <Mail size={14} /> {contact.email}
                </a>
                {contact.telefon && (
                  <a href={`tel:${contact.telefon}`} className="flex items-center gap-1.5 text-[#3a8fbf] hover:underline">
                    <Phone size={14} /> {contact.telefon}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
