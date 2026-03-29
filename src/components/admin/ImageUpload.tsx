"use client";
import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  height?: string;
}

export default function ImageUpload({ value, onChange, label = "Fotoğraf", height = "h-36" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya 5MB'dan büyük olamaz.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) onChange(data.url);
      else alert(data.error || "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {value ? (
        <div className={`relative ${height} rounded-lg overflow-hidden border border-gray-200`}>
          <Image src={value} alt="preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`${height} flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            drag ? "border-blue-400 bg-[#f0f9ff]" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          {uploading ? (
            <Loader2 size={24} className="text-[#5aaddc] animate-spin" />
          ) : (
            <>
              <Upload size={24} className="text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">Tıkla veya sürükle bırak</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP (max 5MB)</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}
    </div>
  );
}
