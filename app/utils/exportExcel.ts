import type { ChartConfiguration } from 'chart.js'
import type { Worksheet } from 'exceljs'
import { hitungRingkasan, pengeluaranPerKategori, type Transaksi } from '~/composables/useTransaksi'

interface OpsiExport {
  transaksi: Transaksi[] // transaksi yang sudah difilter
  semua: Transaksi[] // semua transaksi (untuk grafik tren bulanan)
  periode: string // keterangan periode, misal "Oktober 2026"
  bulanAkhir: string // bulan terakhir untuk tren, format YYYY-MM
  namaFile: string
}

const FORMAT_RUPIAH = '"Rp" #,##0;[Red]-"Rp" #,##0'
const WARNA_UTAMA = 'FF0F766E'
const WARNA_KATEGORI = ['#0f766e', '#dc2626', '#f59e0b', '#2563eb', '#7c3aed', '#db2777', '#65a30d', '#6b7280']

export async function exportExcel(opsi: OpsiExport) {
  // Library baru dimuat saat tombol diklik, supaya halaman awal tetap ringan
  const { default: ExcelJS } = await import('exceljs')

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Duitku Rapi Lho'
  workbook.created = new Date()

  await buatSheetRingkasan(workbook, opsi)
  buatSheetTransaksi(workbook.addWorksheet('Transaksi'), opsi.transaksi)

  const buffer = await workbook.xlsx.writeBuffer()
  unduh(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    opsi.namaFile,
  )
}

// ---------- Sheet 1: Ringkasan + grafik ----------

async function buatSheetRingkasan(workbook: import('exceljs').Workbook, opsi: OpsiExport) {
  const sheet = workbook.addWorksheet('Ringkasan', { views: [{ showGridLines: false }] })
  sheet.columns = [{ width: 24 }, { width: 18 }, { width: 18 }, { width: 18 }]

  sheet.getCell('A1').value = 'Laporan Keuangan — Duitku Rapi Lho'
  sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: WARNA_UTAMA } }
  sheet.getCell('A2').value = `Periode: ${opsi.periode}`
  sheet.getCell('A3').value = `Dibuat: ${new Date().toLocaleString('id-ID')}`
  sheet.getCell('A2').font = sheet.getCell('A3').font = { color: { argb: 'FF6B7280' } }

  // Ringkasan total
  const ringkasan = hitungRingkasan(opsi.transaksi)
  let baris = 5
  judulTabel(sheet, baris++, ['Ringkasan', 'Jumlah'])
  for (const [label, nilai] of [
    ['Total Pemasukan', ringkasan.pemasukan],
    ['Total Pengeluaran', ringkasan.pengeluaran],
    ['Saldo', ringkasan.saldo],
  ] as const) {
    const row = sheet.getRow(baris++)
    row.values = [label, nilai]
    row.getCell(2).numFmt = FORMAT_RUPIAH
  }
  sheet.getRow(baris - 1).font = { bold: true }

  // Tabel pengeluaran per kategori
  const perKategori = pengeluaranPerKategori(opsi.transaksi)
  baris += 1
  judulTabel(sheet, baris++, ['Pengeluaran per Kategori', 'Jumlah', 'Persentase'])
  for (const k of perKategori) {
    const row = sheet.getRow(baris++)
    row.values = [k.kategori, k.nominal, ringkasan.pengeluaran ? k.nominal / ringkasan.pengeluaran : 0]
    row.getCell(2).numFmt = FORMAT_RUPIAH
    row.getCell(3).numFmt = '0.0%'
  }
  if (perKategori.length === 0) sheet.getRow(baris++).values = ['(belum ada pengeluaran)']

  // Tabel tren 6 bulan terakhir
  const tren = hitungTren(opsi.semua, opsi.bulanAkhir, 6)
  baris += 1
  judulTabel(sheet, baris++, ['Tren 6 Bulan', 'Pemasukan', 'Pengeluaran', 'Selisih'])
  for (const b of tren) {
    const row = sheet.getRow(baris++)
    row.values = [b.label, b.pemasukan, b.pengeluaran, b.pemasukan - b.pengeluaran]
    for (const c of [2, 3, 4]) row.getCell(c).numFmt = FORMAT_RUPIAH
  }

  // Grafik (digambar dengan Chart.js lalu ditempel sebagai gambar)
  if (perKategori.length > 0) {
    const pie = await gambarGrafik({
      type: 'doughnut',
      data: {
        labels: perKategori.map((k) => k.kategori),
        datasets: [{ data: perKategori.map((k) => k.nominal), backgroundColor: WARNA_KATEGORI }],
      },
      options: {
        plugins: {
          title: { display: true, text: 'Pengeluaran per Kategori', font: { size: 18 } },
          legend: { position: 'right' },
        },
      },
    })
    sheet.addImage(workbook.addImage({ base64: pie, extension: 'png' }), {
      tl: { col: 5, row: 0 },
      ext: { width: 540, height: 300 },
    })
  }

  const bar = await gambarGrafik({
    type: 'bar',
    data: {
      labels: tren.map((b) => b.label),
      datasets: [
        { label: 'Pemasukan', data: tren.map((b) => b.pemasukan), backgroundColor: '#15803d' },
        { label: 'Pengeluaran', data: tren.map((b) => b.pengeluaran), backgroundColor: '#dc2626' },
      ],
    },
    options: {
      plugins: { title: { display: true, text: 'Pemasukan vs Pengeluaran (6 Bulan)', font: { size: 18 } } },
      scales: { y: { grace: '10%', ticks: { callback: (v) => formatRupiah(Number(v)) } } },
    },
  })
  sheet.addImage(workbook.addImage({ base64: bar, extension: 'png' }), {
    tl: { col: 5, row: 17 },
    ext: { width: 540, height: 300 },
  })
}

// ---------- Sheet 2: Daftar transaksi ----------

function buatSheetTransaksi(sheet: Worksheet, transaksi: Transaksi[]) {
  sheet.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 14, style: { numFmt: 'dd/mm/yyyy' } },
    { header: 'Jenis', key: 'jenis', width: 14 },
    { header: 'Kategori', key: 'kategori', width: 16 },
    { header: 'Catatan', key: 'catatan', width: 32 },
    { header: 'Pemasukan', key: 'pemasukan', width: 18, style: { numFmt: FORMAT_RUPIAH } },
    { header: 'Pengeluaran', key: 'pengeluaran', width: 18, style: { numFmt: FORMAT_RUPIAH } },
  ]
  judulTabel(sheet, 1)
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  for (const t of transaksi) {
    const [tahun, bulan, tanggal] = t.tanggal.split('-').map(Number)
    sheet.addRow({
      // Pakai UTC supaya tanggal tidak mundur sehari di zona waktu Indonesia
      tanggal: new Date(Date.UTC(tahun!, bulan! - 1, tanggal!)),
      jenis: t.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      kategori: t.kategori,
      catatan: t.catatan,
      pemasukan: t.jenis === 'pemasukan' ? t.nominal : null,
      pengeluaran: t.jenis === 'pengeluaran' ? t.nominal : null,
    })
  }

  // Baris total memakai rumus Excel, jadi ikut berubah kalau datanya diedit
  const akhir = transaksi.length + 1
  sheet.autoFilter = { from: 'A1', to: `F${akhir}` }
  const total = sheet.addRow({
    catatan: 'TOTAL',
    pemasukan: { formula: `SUM(E2:E${akhir})` },
    pengeluaran: { formula: `SUM(F2:F${akhir})` },
  })
  total.font = { bold: true }
  const saldo = sheet.addRow({ catatan: 'SALDO', pemasukan: { formula: `E${akhir + 1}-F${akhir + 1}` } })
  saldo.font = { bold: true }
}

// ---------- Helper ----------

function judulTabel(sheet: Worksheet, baris: number, nilai?: string[]) {
  const row = sheet.getRow(baris)
  if (nilai) row.values = nilai
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARNA_UTAMA } }
  })
}

function geserBulan(bulan: string, selisih: number) {
  const [tahun, bln] = bulan.split('-').map(Number)
  const d = new Date(tahun!, bln! - 1 + selisih, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function hitungTren(semua: Transaksi[], bulanAkhir: string, jumlahBulan: number) {
  return Array.from({ length: jumlahBulan }, (_, i) => {
    const bulan = geserBulan(bulanAkhir, i - jumlahBulan + 1)
    const { pemasukan, pengeluaran } = hitungRingkasan(semua.filter((t) => t.tanggal.startsWith(bulan)))
    const label = new Date(`${bulan}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    return { label, pemasukan, pengeluaran }
  })
}

// Gambar grafik di canvas tersembunyi, lalu ubah jadi gambar PNG (base64)
async function gambarGrafik(config: ChartConfiguration): Promise<string> {
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)

  const canvas = document.createElement('canvas')
  canvas.width = 720
  canvas.height = 400

  const latarPutih = {
    id: 'latarPutih',
    beforeDraw: (chart: { ctx: CanvasRenderingContext2D; width: number; height: number }) => {
      chart.ctx.save()
      chart.ctx.fillStyle = '#ffffff'
      chart.ctx.fillRect(0, 0, chart.width, chart.height)
      chart.ctx.restore()
    },
  }

  const chart = new Chart(canvas, {
    ...config,
    options: { ...config.options, responsive: false, animation: false, devicePixelRatio: 2 },
    plugins: [latarPutih],
  } as ChartConfiguration)
  const gambar = chart.toBase64Image('image/png', 1)
  chart.destroy()
  return gambar
}

function unduh(blob: Blob, namaFile: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = namaFile
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
