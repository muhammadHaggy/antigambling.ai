import React from "react";
import Image from "next/image";

interface ReportTemplateProps {
  nama: string;
  tanggal: string;
  ringkasanKeuangan: string;
  ringkasanKeuanganBullet?: string[];
  metrikUtama: string;
  metrikUtamaBullet?: string[];
  insight: string;
  insightBullet?: string[];
  catatanTambahan?: React.ReactNode;
  totalPemasukan?: string;
  totalPengeluaran?: string;
}

export default function ReportTemplate({
  nama,
  tanggal,
  ringkasanKeuangan,
  ringkasanKeuanganBullet,
  metrikUtama,
  metrikUtamaBullet,
  insight,
  insightBullet,
  catatanTambahan,
  totalPemasukan,
  totalPengeluaran,
}: ReportTemplateProps) {
  return (
    <div
      className="report-template bg-white text-black font-serif mx-auto border border-gray-300 shadow-lg relative print:p-0 print:shadow-none print:border-none flex flex-col justify-between"
      style={{
        width: '19cm',
        maxWidth: '19cm',
        minHeight: '24.7cm',
        boxSizing: 'border-box',
        margin: '2.5cm auto',
        padding: '0 2cm',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        fontSize: '14px',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      {/* Header */}
      <div className="bg-white w-full px-2 pt-6 pb-2">
        <div className="flex flex-row justify-between items-start w-full">
          {/* Kiri: Logo + Judul + Tagline */}
          <div className="flex flex-row items-start gap-3">
            <Image src="/images/image copy.png" alt="Logo" width={60} height={60} className="mt-0" />
            <div className="flex flex-col justify-start" style={{fontFamily: 'Times New Roman, Times, serif'}}>
              <span className="font-bold leading-tight" style={{fontSize:16, color:'#222'}}>
                AntiGambling<span style={{color:'#2563eb'}}>.ai</span>
              </span>
              <span className="font-bold leading-tight mt-1" style={{fontSize:14, color:'#222', wordBreak:'break-word', whiteSpace:'pre-line'}}>
                Transforming the cycle of chaos into financial Clarity
              </span>
            </div>
          </div>
          {/* Kanan: Nama & Tanggal */}
          <div className="flex flex-col items-end mt-1 min-w-[140px] gap-2" style={{fontFamily: 'Times New Roman, Times, serif'}}>
            <div className="font-bold" style={{fontSize:14, color:'#222'}}><span>Nama</span> <span>:</span></div>
            <div className="font-bold" style={{fontSize:14, color:'#222'}}><span>Tanggal</span> <span>:</span></div>
          </div>
        </div>
      </div>
      {/* Divider Garis Biasa Pasti Muncul */}
      <hr
        style={{
          width: '96%',
          height: '2px',
          margin: '0 auto 24px auto',
          border: 'none',
          borderTop: '2px solid #222',
          borderRadius: '2px',
          background: 'none',
        }}
      />
      {/* Ringkasan Keuangan */}
      <div className="mb-6">
        <div className="bg-gray-200 border border-black rounded-t-lg px-4 py-2 font-bold text-xl text-left" style={{fontSize:14, fontFamily:'Times New Roman, Times, serif'}}>Ringkasan Keuangan</div>
        <div className="bg-gray-50 border border-black border-t-0 rounded-b-lg px-4 py-4 text-base whitespace-pre-wrap" style={{fontSize:12, fontFamily:'Times New Roman, Times, serif'}}>
          {ringkasanKeuangan}
          {ringkasanKeuanganBullet && ringkasanKeuanganBullet.length > 0 && (
            <ul className="list-disc ml-6 mt-2">
              {ringkasanKeuanganBullet.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>
        {(totalPemasukan || totalPengeluaran) && (
          <div className="flex gap-8 mt-2 text-base font-semibold">
            {totalPemasukan && <span>Total Pemasukan: <span className="text-green-700">{totalPemasukan}</span></span>}
            {totalPengeluaran && <span>Total Pengeluaran: <span className="text-red-700">{totalPengeluaran}</span></span>}
          </div>
        )}
      </div>
      {/* Metrik Utama */}
      <div className="mb-6">
        <div className="bg-gray-200 border border-black rounded-t-lg px-4 py-2 font-bold text-xl text-left" style={{fontSize:14, fontFamily:'Times New Roman, Times, serif'}}>Metrik Utama</div>
        <div className="bg-gray-50 border border-black border-t-0 rounded-b-lg px-4 py-4 text-base whitespace-pre-wrap" style={{fontSize:12, fontFamily:'Times New Roman, Times, serif'}}>
          {metrikUtama}
          {metrikUtamaBullet && metrikUtamaBullet.length > 0 && (
            <ul className="list-disc ml-6 mt-2">
              {metrikUtamaBullet.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>
      </div>
      {/* Insight */}
      <div className="mb-6">
        <div className="bg-gray-200 border border-black rounded-t-lg px-4 py-2 font-bold text-xl text-left" style={{fontSize:14, fontFamily:'Times New Roman, Times, serif'}}>Insight</div>
        <div className="bg-gray-50 border border-black border-t-0 rounded-b-lg px-4 py-4 text-base whitespace-pre-wrap" style={{fontSize:12, fontFamily:'Times New Roman, Times, serif'}}>
          {insight}
          {insightBullet && insightBullet.length > 0 && (
            <ul className="list-disc ml-6 mt-2">
              {insightBullet.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>
      </div>
      {/* Catatan Tambahan */}
      <div className="mb-6">
        <div className="bg-gray-200 border border-black rounded-t-lg px-4 py-2 font-bold text-xl text-left" style={{fontSize:14, fontFamily:'Times New Roman, Times, serif'}}>Catatan Tambahan</div>
        <div className="border border-black border-t-0 rounded-b-lg px-4 py-2" style={{fontSize:12, fontFamily:'Times New Roman, Times, serif'}}>
          <ul style={{margin:0, paddingLeft:18, listStyleType:'disc'}}>
            <li>Analisis ini didasarkan pada data mutasi yang tersedia. Untuk analisis yang lebih komprehensif, data transaksi selama beberapa bulan diperlukan. Juga perlu diperhatikan bahwa beberapa transaksi mungkin tidak dapat diklasifikasikan secara pasti tanpa informasi tambahan.</li>
          </ul>
        </div>
      </div>
      <div className="flex-1" />
      {/* Footer */}
      <div className="report-footer w-full flex justify-between items-center text-xs text-gray-500 mt-8 print:mt-0" style={{minHeight:'32px'}}>
        <span>© 2025 AntiGambling.ai. All rights reserved.</span>
        <span className="flex items-center gap-1"><Image src="/images/image copy.png" alt="Logo" width={36} height={36} /> AntiGambling.ai</span>
      </div>
      <style jsx global>{`
        .report-template, .report-template * {
          color: #222 !important;
          background: #fff !important;
          border-color: #222 !important;
        }
        @media print {
          .report-footer {
            position: fixed;
            bottom: 0.5cm;
            left: 2cm;
            right: 2cm;
            width: calc(100% - 4cm);
          }
        }
        table, th, td {
          border-collapse: collapse;
        }
      `}</style>
    </div>
  );
} 