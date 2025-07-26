"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";




export default function KonsultasiFinansialPage() {
  const [, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSummary(null);
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        // Simpan summary ke localStorage agar bisa diakses di preview
        if (typeof window !== 'undefined') {
          localStorage.setItem("finansialSummary", data.summary);
        }
        // Redirect ke preview
        router.push("/ahli-finansial/preview");
      } else {
        setError(data.error || "Gagal menganalisis dokumen.");
      }
    } catch {
      setError("Terjadi kesalahan saat upload atau analisis file.");
    } finally {
      setLoading(false);
    }
  };


  // Hapus seluruh logic dan komponen preview tabel Ringkasan Keuangan
  // Jangan render tabelGeminiPipe, tabelMarkdownGemini, atau RingkasanKeuanganTable apapun

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#181c20]">
      <div className="w-full max-w-4xl flex flex-col items-center py-16 px-2 sm:px-6">
        <h1 className="text-4xl font-extrabold mb-3 text-center text-white drop-shadow-lg tracking-tight">Konsultasi Finansial</h1>
        <p className="text-[#8ca0b3] mb-10 text-center max-w-2xl text-lg font-medium">
          Dapatkan analisis keuangan otomatis dari mutasi rekening Anda.
        </p>
        <div className="bg-[#23272e] rounded-2xl p-8 border border-[#2e3742] shadow-xl mb-10 w-full max-w-xl flex flex-col items-center">
          <form className="flex flex-col items-center gap-6 w-full" onSubmit={e => e.preventDefault()}>
            <label className="block w-full">
              <span className="text-[#b6c2d1] font-semibold text-base">Upload file mutasi rekening (PDF)</span>
              <input
                type="file"
                accept="application/pdf"
                className="mt-3 block w-full text-[#23272e] bg-[#eaf0f6] border border-[#b6c2d1] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all duration-150 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#3b82f6] file:text-white hover:file:bg-[#2563eb] disabled:opacity-60"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
            {loading && <div className="text-[#3b82f6] font-semibold animate-pulse">Menganalisis dokumen...</div>}
            {error && <div className="text-[#ef4444] font-semibold">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
} 