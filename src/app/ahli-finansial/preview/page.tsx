"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface DocumentData {
  nama: string
  tanggal: string
  ringkasanKeuangan: string
  metrikUtama: string
  insight: string
  catatanTambahan: string
}

// Tambahkan parser Gemini (copy dari konsultasi-finansial/page.tsx)
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

export default function Component() {
  const [documentData, setDocumentData] = useState<DocumentData>({
    nama: "",
    tanggal: "",
    ringkasanKeuangan: "",
    metrikUtama: "",
    insight: "",
    catatanTambahan: "",
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const summary = localStorage.getItem("finansialSummary");
      if (summary) {
        const parsed = parseGeminiSections(summary);
        const isAllEmpty = !parsed.ringkasanKeuangan.narasi && !parsed.metrikUtama.narasi && !parsed.insight.narasi;
        setDocumentData({
          nama: "Nama Pengguna",
          tanggal: new Date().toLocaleDateString("id-ID"),
          ringkasanKeuangan: isAllEmpty ? summary : parsed.ringkasanKeuangan.narasi,
          metrikUtama: isAllEmpty ? "" : parsed.metrikUtama.narasi,
          insight: isAllEmpty ? "" : parsed.insight.narasi,
          catatanTambahan: "Analisis ini didasarkan pada data mutasi yang tersedia. Untuk analisis yang lebih komprehensif, data transaksi selama beberapa bulan diperlukan. Juga perlu diperhatikan bahwa beberapa transaksi mungkin tidak dapat diklasifikasikan secara pasti tanpa informasi tambahan.",
        });
      }
    }
  }, []);

  const downloadAsPDF = () => {
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Control Panel */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Dokumen Mutasi Rekening
              </h1>
              <p className="text-gray-400 mt-1">Dokumen Bersifat Rahasia </p>
            </div>
            <div>
              <Button
                onClick={downloadAsPDF}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-purple-300">Isi dari dokumen:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>
                    <strong>Ringkasan Keuangan:</strong> Analisis Keungan
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>
                    <strong>Metrik Utama:</strong> Format list dengan angka
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>
                    <strong>Insight:</strong> Analisis mendalam dan rekomendasi
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>
                    <strong>Catatan Tambahan:</strong> Metodologi dan disclaimer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Document Pages - Exact A4 Preview */}
      <div className="document-container max-w-4xl mx-auto">
        {/* Page 1 */}
        <div className="a4-page">
          {/* Header */}
          <div className="document-header">
            <div className="relative z-10 flex items-start justify-between p-6 h-full">
              {/* Logo and Branding */}
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                  <span className="text-white font-bold text-2xl">AG</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AntiGambling.ai</h1>
                  <p className="text-white/90 text-sm font-medium tracking-wide">
                    Transforming the cycle of chaos into financial Clarity
                  </p>
                  <div className="mt-3 w-20 h-1 bg-gradient-to-r from-white/60 to-transparent rounded-full"></div>
                </div>
              </div>

              {/* Info Fields */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-white/90 min-w-[60px]">Nama</span>
                    <span className="text-white/70">:</span>
                    <span className="text-white font-medium">{documentData.nama || "[Nama akan diisi di sini]"}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-white/90 min-w-[60px]">Tanggal</span>
                    <span className="text-white/70">:</span>
                    <span className="text-white font-medium">
                      {documentData.tanggal || "[Tanggal akan diisi di sini]"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="document-content">
            {/* Ringkasan Keuangan */}
            <div className="mb-6">
              <h2 className="section-title text-xl mb-4">Ringkasan Keuangan</h2>
              <div className="premium-card p-5">
                {documentData.ringkasanKeuangan ? (
                  <p className="text-gray-700 leading-relaxed font-medium text-sm">{documentData.ringkasanKeuangan}</p>
                ) : (
                  <div className="text-gray-400 italic text-sm leading-relaxed">
                    <p className="mb-3">[Ringkasan keuangan akan diisi di sini]</p>
                    <p className="text-xs text-gray-500">
                      Contoh konten: Analisis tren keuangan, performa revenue, margin keuntungan, cash flow, efisiensi
                      operasional, dan proyeksi pertumbuhan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Metrik Utama */}
            <div className="mb-6">
              <h2 className="section-title text-xl mb-4">Metrik Utama</h2>
              <div className="premium-card p-5">
                {documentData.metrikUtama ? (
                  <pre className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium text-sm">
                    {documentData.metrikUtama}
                  </pre>
                ) : (
                  <div className="text-gray-400 italic text-sm leading-relaxed">
                    <p className="mb-3">[Metrik utama akan diisi di sini dalam format list]</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Contoh format:</p>
                      <p>• Total Revenue: Rp XXX (↑XX% YoY)</p>
                      <p>• Profit Margin: XX% (↑XX% dari periode sebelumnya)</p>
                      <p>• Customer Acquisition Cost: Rp XXX</p>
                      <p>• Customer Lifetime Value: Rp XXX</p>
                      <p>• Dan metrik penting lainnya...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="document-footer">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 font-medium">© 2025 AntiGambling.ai</div>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              <div className="text-sm text-gray-500">All rights reserved</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">AG</span>
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AntiGambling.ai
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">Halaman</div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-gradient-to-r from-purple-300 to-blue-300">
                <span className="text-sm font-bold text-gray-700">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 */}
        <div className="a4-page">
          {/* Header */}
          <div className="document-header">
            <div className="relative z-10 flex items-start justify-between p-6 h-full">
              {/* Logo and Branding */}
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                  <span className="text-white font-bold text-2xl">AG</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AntiGambling.ai</h1>
                  <p className="text-white/90 text-sm font-medium tracking-wide">
                    Transforming the cycle of chaos into financial Clarity
                  </p>
                  <div className="mt-3 w-20 h-1 bg-gradient-to-r from-white/60 to-transparent rounded-full"></div>
                </div>
              </div>

              {/* Info Fields */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-white/90 min-w-[60px]">Nama</span>
                    <span className="text-white/70">:</span>
                    <span className="text-white font-medium">{documentData.nama || "[Nama akan diisi di sini]"}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-white/90 min-w-[60px]">Tanggal</span>
                    <span className="text-white/70">:</span>
                    <span className="text-white font-medium">
                      {documentData.tanggal || "[Tanggal akan diisi di sini]"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="document-content">
            {/* Insight */}
            <div className="mb-8">
              <h2 className="section-title text-xl mb-6">Insight</h2>
              <div className="premium-card p-6">
                {documentData.insight ? (
                  <p className="text-gray-700 leading-relaxed font-medium">{documentData.insight}</p>
                ) : (
                  <div className="text-gray-400 italic leading-relaxed">
                    <p className="mb-3">[Insight dan analisis mendalam akan diisi di sini]</p>
                    <p className="text-xs text-gray-500">
                      Contoh konten: Analisis tren pasar, segmentasi customer, channel performance, behavioral analysis,
                      seasonal patterns, dan strategic recommendations.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div className="mb-8">
              <h2 className="section-title text-xl mb-6">Catatan Tambahan</h2>
              <div className="premium-card p-6">
                {documentData.catatanTambahan ? (
                  <p className="text-gray-700 leading-relaxed font-medium">{documentData.catatanTambahan}</p>
                ) : (
                  <div className="text-gray-400 italic leading-relaxed">
                    <p className="mb-3">[Catatan tambahan, metodologi, dan disclaimer akan diisi di sini]</p>
                    <p className="text-xs text-gray-500">
                      Contoh konten: Metodologi analisis, data sources, limitations, recommendations, risk assessment,
                      dan future roadmap.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="document-footer">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 font-medium">© 2025 AntiGambling.ai</div>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              <div className="text-sm text-gray-500">All rights reserved</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">AG</span>
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AntiGambling.ai
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">Halaman</div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-gradient-to-r from-purple-300 to-blue-300">
                <span className="text-sm font-bold text-gray-700">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @page {
    size: A4;
    margin: 0;
  }
  @media print {
    * {
      background: white !important;
      color: #222 !important;
      box-shadow: none !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body { 
      margin: 0; 
      padding: 0;
      font-family: 'Inter', sans-serif;
      background: white !important;
    }
    .document-container { 
      margin: 0; 
      padding: 0;
    }
    .a4-page { 
      margin: 0 !important; 
      padding: 0 !important;
      box-shadow: none !important;
      page-break-after: always;
      page-break-inside: avoid !important;
      border-radius: 0 !important;
      background: white !important;
    }
    .a4-page:last-child {
      page-break-after: avoid !important;
    }
  }
  body {
    font-family: 'Inter', sans-serif;
  }
  .a4-page {
    width: 210mm;
    height: 297mm;
    margin: 0 auto 30px auto;
    background: white;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  }
  .document-header {
    height: 60mm;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .document-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E");
  }
  .document-content {
    flex: 1;
    padding: 10mm;
    background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
    overflow: hidden;
  }
  .document-footer {
    height: 15mm;
    background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%);
    border-top: 3px solid transparent;
    border-image: linear-gradient(90deg, #667eea, #764ba2) 1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15mm;
  }
  .premium-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
  .premium-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
  .section-title {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
    position: relative;
  }
  .section-title::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }
`}</style>
    </div>
  )
} 