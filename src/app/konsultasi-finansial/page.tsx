"use client";

import React, { useState } from "react";
import ReportTemplate from "./ReportTemplate";
// HAPUS: import jsPDF from "jspdf";
// HAPUS: import html2canvas from "html2canvas";
// HAPUS: import html2pdf from "html2pdf.js";
import { useRouter } from "next/navigation";

// Removed unused functions renderBold, safe, and highlightKeywords

// Removed unused function parseGeminiSummary

function parseGeminiSections(text: string) {
  const sections = {
    ringkasanKeuangan: { narasi: '', bullet: [] as string[] },
    metrikUtama: { narasi: '', bullet: [] as string[] },
    insight: { narasi: '', bullet: [] as string[] }
  };
  if (!text) return sections;
  // Split section dengan regex heading yang lebih longgar
  const parts = text.split(/\n?\s*\d+\.?\s*(Ringkasan Keuangan|Metrik Utama|Insight)\s*:?/i).map(s => s.trim());
  // parts: ['', 'Ringkasan Keuangan', <isi>, 'Metrik Utama', <isi>, 'Insight', <isi>]
  function splitNarasiBullet(sectionText: string) {
    const lines = sectionText.split('\n').map(l => l.trim());
    const narasi = lines.filter(l => l && !l.startsWith('*')).join(' ');
    const bullet = lines.filter(l => l.startsWith('*')).map(l => l.replace(/^\*\s*/, ''));
    return { narasi, bullet };
  }
  for (let i = 1; i < parts.length; i += 2) {
    const section = (parts[i] || '').toLowerCase();
    const isi = parts[i + 1] || '';
    if (section.includes('ringkasan')) Object.assign(sections.ringkasanKeuangan, splitNarasiBullet(isi));
    if (section.includes('metrik')) Object.assign(sections.metrikUtama, splitNarasiBullet(isi));
    if (section.includes('insight')) Object.assign(sections.insight, splitNarasiBullet(isi));
  }
  return sections;
}

// Removed unused function extractRingkasanKeuanganParagraf



export default function KonsultasiFinansialPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // HAPUS: const reportRef = useRef<HTMLDivElement>(null);
  // HAPUS: const [html2pdfInstance, setHtml2pdfInstance] = useState<any>(null);

  // HAPUS: useEffect(() => {
  // HAPUS:   if (typeof window !== "undefined") {
  // HAPUS:     import("html2pdf.js").then(mod => {
  // HAPUS:       if (typeof mod === 'function') setHtml2pdfInstance(() => mod);
  // HAPUS:       else if (mod && typeof mod.default === 'function') setHtml2pdfInstance(() => mod.default);
  // HAPUS:       else if ((window as any).html2pdf) setHtml2pdfInstance(() => (window as any).html2pdf);
  // HAPUS:       else setHtml2pdfInstance(null);
  // HAPUS:       console.log('html2pdf.js loaded', mod, typeof mod, typeof mod.default, (window as any).html2pdf);
  // HAPUS:     }).catch(err => {
  // HAPUS:       if ((window as any).html2pdf) setHtml2pdfInstance(() => (window as any).html2pdf);
  // HAPUS:       else setHtml2pdfInstance(null);
  // HAPUS:       console.error('html2pdf.js import failed', err);
  // HAPUS:     });
  // HAPUS:   }
  // HAPUS: }, []);

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

  // HAPUS: const handleDownloadPDF = async () => {
  // HAPUS:   if (reportRef.current) {
  // HAPUS:     const canvas = await html2canvas(reportRef.current, { scale: 2 });
  // HAPUS:     const imgData = canvas.toDataURL("image/png");
  // HAPUS:     const pdf = new jsPDF({
  // HAPUS:       orientation: "portrait",
  // HAPUS:       unit: "cm",
  // HAPUS:       format: "a4"
  // HAPUS:     });
  // HAPUS:     const pageWidth = pdf.internal.pageSize.getWidth();
  // HAPUS:     const pageHeight = pdf.internal.pageSize.getHeight();
  // HAPUS:     const imgProps = pdf.getImageProperties(imgData);
  // HAPUS:     const pdfWidth = pageWidth;
  // HAPUS:     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  // HAPUS:     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  // HAPUS:     pdf.save("Laporan-Konsultasi-Finansial.pdf");
  // HAPUS:   }
  // HAPUS: };

  const parsedSections = parseGeminiSections(summary || '');

  // Hapus seluruh logic dan komponen preview tabel Ringkasan Keuangan
  // Jangan render tabelGeminiPipe, tabelMarkdownGemini, atau RingkasanKeuanganTable apapun

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#181c20]">
      <div className="w-full max-w-5xl flex flex-col items-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Konsultasi Finansial</h1>
        <p className="text-gray-600 mb-8 text-center max-w-2xl">
          Dapatkan analisis keuangan otomatis dari mutasi rekening Anda.
        </p>
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow mb-8 w-full max-w-2xl">
          <form className="flex flex-col items-center gap-4" onSubmit={e => e.preventDefault()}>
            <label className="block w-full">
              <span className="text-gray-700 font-medium">Upload file mutasi rekening (PDF)</span>
              <input
                type="file"
                accept="application/pdf"
                className="mt-2 block w-full text-gray-700 bg-gray-100 border border-gray-300 rounded-lg p-2 focus:outline-none"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
            {loading && <div className="text-blue-500">Menganalisis dokumen...</div>}
            {error && <div className="text-red-500">{error}</div>}
          </form>
        </div>
        {/* HAPUS: ReportTemplate preview setelah analisis, karena sudah ada halaman preview */}
        {false && summary && (
          <div className="w-full flex justify-center">
            <ReportTemplate
              nama="Nama Pengguna"
              tanggal={new Date().toLocaleDateString("id-ID")}
              ringkasanKeuangan={parsedSections.ringkasanKeuangan.narasi}
              ringkasanKeuanganBullet={parsedSections.ringkasanKeuangan.bullet}
              metrikUtama={parsedSections.metrikUtama.narasi}
              metrikUtamaBullet={parsedSections.metrikUtama.bullet}
              insight={parsedSections.insight.narasi}
              insightBullet={parsedSections.insight.bullet}
            />
          </div>
        )}
      </div>
    </div>
  );
} 