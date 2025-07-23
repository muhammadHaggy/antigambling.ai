"use client";

import React, { useState } from "react";
import ReportTemplate from "./ReportTemplate";
// HAPUS: import jsPDF from "jspdf";
// HAPUS: import html2canvas from "html2canvas";
// HAPUS: import html2pdf from "html2pdf.js";
import { useRouter } from "next/navigation";

// Fungsi parser hasil Gemini (pindahkan ke luar komponen agar tidak nested)
function renderBold(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function safe(arr: string[], idx: number) {
  return arr.length > idx ? arr[idx] : '-';
}

function highlightKeywords(text: string) {
  // Highlight kata kunci paylater/pinjaman/dompet digital
  const keywords = [
    'spaylater', 'gopay pinjam', 'paylater', 'pinjaman', 'kredivo', 'akulaku', 'shopee paylater', 'ovo paylater', 'gopay', 'dana', 'ovo', 'dana paylater', 'kredit', 'spinjam', 'shopee', 'shopeepay', 'kartu kredit', 'kartu debit'
  ];
  let result = text;
  keywords.forEach(kw => {
    const re = new RegExp(kw, 'ig');
    result = result.replace(re, match => `<span class='text-blue-700 font-bold'>${match}</span>`);
  });
  return result;
}

function parseGeminiSummary(summary: string | null): {
  ringkasanKeuangan: JSX.Element[] | JSX.Element;
  metrikUtama: JSX.Element[] | JSX.Element;
  insight: JSX.Element | JSX.Element[];
  totalPemasukan?: string;
  totalPengeluaran?: string;
} {
  if (!summary) return {
    ringkasanKeuangan: <tr><td colSpan={4}>-</td></tr>,
    metrikUtama: <tr><td colSpan={4}>-</td></tr>,
    insight: <span>-</span>,
  };

  // Coba parse JSON
  try {
    const data = JSON.parse(summary);
    if (data.ringkasanKeuangan && Array.isArray(data.ringkasanKeuangan)) {
      let totalPemasukan = '';
      let totalPengeluaran = '';
      const rows = data.ringkasanKeuangan.map((cols: string[], i: number) => {
        // Deteksi baris total pemasukan/pengeluaran
        if (/total pemasukan/i.test(cols[0])) totalPemasukan = cols[1];
        if (/total pengeluaran/i.test(cols[0])) totalPengeluaran = cols[1];
        return (
          <tr key={i}>
            <td className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: renderBold(cols[0] || '-')}} />
            <td className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: renderBold(cols[1] || '-')}} />
            <td className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: renderBold(cols[2] || '-')}} />
            <td className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: renderBold(cols[3] || '-')}} />
          </tr>
        );
      });
      const metrik = (data.metrikUtama || []).map((l: string, i: number) => (
        <tr key={i}><td className="px-2 py-1" dangerouslySetInnerHTML={{__html: renderBold(l)}} /></tr>
      ));
      const insight = <ul className="list-disc ml-6">{(data.insight || []).map((l: string, i: number) => <li key={i} dangerouslySetInnerHTML={{__html: renderBold(l)}} />)}</ul>;
      return { ringkasanKeuangan: rows, metrikUtama: metrik, insight, totalPemasukan, totalPengeluaran };
    }
  } catch (e) { /* fallback ke parser markdown/table lama */ }

  // Ambil tabel markdown pertama (Ringkasan Keuangan)
  const tableRegex = /\|(.|\n)*?\|\n/gm;
  const tableMatch = summary.match(tableRegex);
  let ringkasanKeuangan: JSX.Element[] | JSX.Element = <tr><td colSpan={4}>-</td></tr>;
  let totalPemasukan = '';
  let totalPengeluaran = '';
  if (tableMatch && tableMatch[0]) {
    const tableLines = tableMatch[0].split('\n').filter((l: string) => l.trim().startsWith('|'));
    console.log('DEBUG tableLines:', tableLines);
    tableLines.forEach((row, i) => {
      console.log('DEBUG row', i, row, row.split('|').map((s: string) => s.trim()));
    });
    ringkasanKeuangan = tableLines
      .filter((row: string) => !/^\|?[-\s|]+$/.test(row.trim()) && row.trim() !== '|')
      .map((row: string, i: number) => {
        const cols = row.split('|').map((s: string) => s.trim());
        const c0 = renderBold(highlightKeywords(safe(cols, 1)));
        const c1 = renderBold(safe(cols, 2));
        const c2 = renderBold(safe(cols, 3));
        const c3 = renderBold(safe(cols, 4));
        // Deteksi baris total pemasukan/pengeluaran
        if (/total pemasukan/i.test(cols[1])) totalPemasukan = cols[2];
        if (/total pengeluaran/i.test(cols[1])) totalPengeluaran = cols[2];
        return (
          <tr key={i}>
            <td className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: c0}} />
            <td className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: c1}} />
            <td className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: c2}} />
            <td className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: c3}} />
          </tr>
        );
      });
  }

  // Ambil section metrik utama (setelah "Metrik Utama" atau "Metrik")
  let metrikUtama: JSX.Element = <div className="text-gray-700 italic">-</div>;
  const metrikRegex = /(Metrik Utama|Metrik)[\s\S]*?(Insight|Insight Profesional|Catatan|$)/i;
  const metrikMatch = summary.match(metrikRegex);
  if (metrikMatch) {
    const lines = metrikMatch[0].split('\n').filter((l: string) => l.trim().startsWith('*'));
    if (lines.length > 0) {
      metrikUtama = <ul className="list-disc ml-6">{lines.map((l: string, i: number) => <li key={i} dangerouslySetInnerHTML={{__html: renderBold(l.replace(/^\*+\s*/, ''))}} />)}</ul>;
    }
  }

  // Ambil section insight (setelah "Insight" atau "Insight Profesional")
  let insight: JSX.Element = <div className="text-gray-700 italic">-</div>;
  const insightRegex = /(Insight Profesional|Insight)[\s\S]*?(Catatan|$)/i;
  const insightMatch = summary.match(insightRegex);
  if (insightMatch) {
    const lines = insightMatch[0].split('\n').filter((l: string) => l.trim().startsWith('*'));
    if (lines.length > 0) {
      insight = <ul className="list-disc ml-6">{lines.map((l: string, i: number) => <li key={i} dangerouslySetInnerHTML={{__html: renderBold(l.replace(/^\*+\s*/, ''))}} />)}</ul>;
    }
  }

  return { ringkasanKeuangan, metrikUtama, insight, totalPemasukan, totalPengeluaran };
}

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

function extractRingkasanKeuanganParagraf(summary: string | null): string {
  if (!summary) return '';
  // Cari blok Ringkasan Keuangan (tabel markdown pertama)
  const tableBlockMatch = summary.match(/\|(.|\n)*?\|\n/gm);
  if (!tableBlockMatch || !tableBlockMatch[0]) return '';
  const lines = tableBlockMatch[0].split('\n').filter(l => l.trim().startsWith('|'));
  // Buang header dan baris pemisah
  const dataLines = lines.filter(row => !/^\|?[-\s|]+$/.test(row.trim()) && !/kategori/i.test(row));
  // Gabungkan setiap baris menjadi narasi
  const narasi = dataLines.map(row => {
    const cols = row.split('|').map(s => s.trim());
    // Gabungkan kolom jadi kalimat
    return cols.slice(1, 5).filter(Boolean).join(' | ');
  }).join('; ');
  return narasi;
}

function parseMarkdownTableByPipeCount(markdown: string) {
  // Ambil semua baris yang mengandung tepat 5 pipe (4 kolom data)
  return markdown
    .split('\n')
    .filter(line => (line.match(/\|/g) || []).length === 5)
    .map(line => line.split('|').map(s => s.trim()).slice(1, 5)); // slice untuk buang kolom kosong di awal/akhir
}

function TabelGeminiPipe({ rows }: { rows: string[][] }) {
  return (
    <table className="w-full border border-black border-t-0 rounded-b-lg text-base overflow-hidden" style={{borderRadius:'0 0 12px 12px'}}>
      <tbody>
        {rows.map((cols, i) => (
          <tr key={i}>
            {cols.map((cell, j) => (
              <td key={j} className="border border-black px-2 py-1" dangerouslySetInnerHTML={{__html: renderBold(highlightKeywords(cell || '-'))}} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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
    } catch (err) {
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

  const parsed = parseGeminiSummary(summary);
  const ringkasanKeuanganParagraf = extractRingkasanKeuanganParagraf(summary);
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