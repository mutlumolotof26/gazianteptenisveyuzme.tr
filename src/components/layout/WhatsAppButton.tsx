"use client";

interface WhatsAppButtonProps {
  phoneNumber: string;
}

export default function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
  if (!phoneNumber) return null;

  // Sadece rakamları al, başına 90 ekle (Türkiye)
  const cleaned = phoneNumber.replace(/\D/g, "");
  const waNumber = cleaned.startsWith("90") ? cleaned : cleaned.startsWith("0") ? "9" + cleaned : "90" + cleaned;
  const waUrl = `https://wa.me/${waNumber}?text=Merhaba%2C%20size%20bir%20sorum%20var.`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişim"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.52-1.74A13.92 13.92 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.4a11.36 11.36 0 0 1-5.8-1.58l-.42-.25-4.34 1 1.03-4.22-.27-.44A11.37 11.37 0 0 1 4.6 16C4.6 9.72 9.72 4.6 16 4.6S27.4 9.72 27.4 16 22.28 27.4 16 27.4zm6.25-8.54c-.34-.17-2.02-.99-2.33-1.1-.31-.12-.54-.17-.77.17-.23.34-.88 1.1-1.08 1.33-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.12-.22.06-.43-.03-.6-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59h-.66c-.22 0-.57.08-.87.4-.3.31-1.14 1.12-1.14 2.72s1.17 3.16 1.33 3.38c.17.22 2.3 3.5 5.57 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 2.02-.83 2.3-1.62.29-.8.29-1.48.2-1.62-.08-.14-.31-.22-.65-.39z"/>
      </svg>
    </a>
  );
}
