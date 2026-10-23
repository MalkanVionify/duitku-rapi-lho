import type { DataTransaksi, JenisTransaksi } from '~/composables/useTransaksi'

// Kata kunci → kategori. Dicocokkan di awal kata, jadi "makan" juga cocok dengan "makanan".
// Kata kunci yang diakhiri spasi ("mi ", "air ") harus berupa kata utuh.
const KATA_KUNCI: Record<JenisTransaksi, Record<string, string[]>> = {
  pemasukan: {
    Gaji: ['gaji', 'gajian', 'salary', 'upah'],
    Bonus: ['bonus', 'thr', 'insentif', 'komisi', 'cashback', 'refund'],
    Usaha: ['usaha', 'jualan', 'jual', 'penjualan', 'dagang', 'freelance', 'proyek', 'project', 'untung', 'laba'],
    Hadiah: ['hadiah', 'angpao', 'angpau', 'kado', 'dikasih', 'dikirimi'],
  },
  pengeluaran: {
    Makanan: [
      'makan', 'sarapan', 'bakso', 'nasi', 'mie', 'mi ', 'kopi', 'ngopi', 'jajan', 'minum', 'snack', 'ayam', 'sate',
      'soto', 'gofood', 'grabfood', 'shopeefood', 'martabak', 'roti', 'boba', 'teh', 'kue', 'warteg', 'padang', 'pizza',
      'burger', 'seblak', 'cilok', 'gorengan', 'susu', 'buah', 'sayur', 'galon', 'bubur', 'gado', 'pecel', 'lauk',
    ],
    Transportasi: [
      'bensin', 'pertalite', 'pertamax', 'solar', 'parkir', 'tol', 'ojek', 'ojol', 'gojek', 'goride', 'gocar', 'grab',
      'taksi', 'taxi', 'kereta', 'krl', 'mrt', 'lrt', 'busway', 'transjakarta', 'bus', 'angkot', 'servis', 'service', 'oli',
    ],
    Belanja: [
      'belanja', 'baju', 'kaos', 'celana', 'sepatu', 'sandal', 'tas ', 'shopee', 'tokopedia', 'tokped', 'lazada',
      'indomaret', 'alfamart', 'supermarket', 'sabun', 'sampo', 'shampo', 'skincare', 'kosmetik', 'detergen',
    ],
    Tagihan: [
      'listrik', 'pln', 'token', 'pdam', 'air ', 'internet', 'wifi', 'indihome', 'pulsa', 'kuota', 'cicilan', 'kredit',
      'sewa', 'kos ', 'kost', 'kontrakan', 'bpjs', 'asuransi', 'iuran', 'pajak', 'tagihan', 'langganan',
    ],
    Hiburan: [
      'nonton', 'bioskop', 'film', 'netflix', 'youtube', 'game', 'liburan', 'wisata', 'konser', 'karaoke', 'hotel',
      'staycation',
    ],
    Kesehatan: ['obat', 'dokter', 'apotek', 'rumah sakit', 'klinik', 'vitamin', 'gigi', 'periksa', 'puskesmas'],
    Pendidikan: ['buku', 'kursus', 'sekolah', 'spp', 'kuliah', 'ukt', 'les ', 'seminar', 'pelatihan', 'kelas', 'webinar'],
  },
}

// Kata yang menandakan uang masuk walau kategorinya tidak dikenali
const TANDA_MASUK = ['terima', 'dapat', 'dapet', 'diterima']

export interface HasilKetikCepat {
  data: DataTransaksi
  // false kalau kategori tidak dikenali dan jatuh ke "Lainnya"
  kategoriDitebak: boolean
}

function geserTanggal(hari: number) {
  const d = new Date()
  d.setDate(d.getDate() + hari)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function cocok(teks: string, kata: string) {
  // Spasi tambahan di ujung supaya kata kunci "mi " juga cocok di akhir kalimat.
  // Setiap kemunculan harus diawali batas kata (bukan huruf di depannya).
  return ` ${teks.toLowerCase()} `.split(kata).slice(0, -1).some((sebelum) => !/[a-z]$/.test(sebelum))
}

// Ambil tanggal dari kalimat, kembalikan [tanggal, kalimat tanpa kata tanggalnya]
function bacaTanggal(teks: string): [string, string] {
  const aturan: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/\bkemarin\s+lusa\b/i, () => geserTanggal(-2)],
    [/\bkemarin\b/i, () => geserTanggal(-1)],
    [/\b(\d{1,2})\s+hari\s+(yang\s+)?lalu\b/i, (m) => geserTanggal(-Number(m[1]))],
    [/\b(hari\s+ini|tadi(\s+(pagi|siang|sore|malam))?)\b/i, () => hariIni()],
    [/\b(tgl|tanggal)\s*(\d{1,2})\b/i, (m) => `${bulanIni()}-${m[2]!.padStart(2, '0')}`],
  ]
  for (const [pola, hasil] of aturan) {
    const m = teks.match(pola)
    if (m) return [hasil(m), teks.replace(pola, ' ')]
  }
  return [hariIni(), teks]
}

// Ambil nominal: "15rb", "15 ribu", "50k", "1,5jt", "2 juta", "25.000", "25000"
function bacaNominal(teks: string): [number, string] | null {
  const m = teks.match(/(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta)?(?![a-z0-9])/i)
  if (!m) return null
  const [utuh, angka, satuan] = m
  let nilai: number
  if (satuan) {
    const kali = /^(jt|juta)$/i.test(satuan) ? 1_000_000 : 1_000
    nilai = Number(angka!.replace(',', '.')) * kali
  } else {
    nilai = Number(angka!.replace(/[.,]/g, ''))
  }
  if (!Number.isFinite(nilai) || nilai <= 0) return null
  return [Math.round(nilai), teks.replace(utuh!, ' ')]
}

function tebakKategori(teks: string, jenis: JenisTransaksi) {
  for (const [kategori, daftar] of Object.entries(KATA_KUNCI[jenis])) {
    if (daftar.some((k) => cocok(teks, k))) return kategori
  }
  return null
}

// Ubah kalimat bebas seperti "bakso 15rb kemarin" menjadi data transaksi.
// Kembalikan null kalau nominalnya tidak ditemukan.
export function bacaKetikCepat(kalimat: string): HasilKetikCepat | null {
  let teks = kalimat.trim()
  if (!teks) return null

  // Tanda + / - di depan memaksa jenis transaksi
  let jenisPaksa: JenisTransaksi | null = null
  if (teks.startsWith('+')) jenisPaksa = 'pemasukan'
  else if (teks.startsWith('-')) jenisPaksa = 'pengeluaran'
  if (jenisPaksa) teks = teks.slice(1)

  const [tanggal, tanpaTanggal] = bacaTanggal(teks)
  const nominal = bacaNominal(tanpaTanggal)
  if (!nominal) return null
  const [jumlah, sisa] = nominal

  const kategoriMasuk = tebakKategori(sisa, 'pemasukan')
  const jenis: JenisTransaksi =
    jenisPaksa ?? (kategoriMasuk || TANDA_MASUK.some((k) => cocok(sisa, k)) ? 'pemasukan' : 'pengeluaran')
  const kategori = jenis === 'pemasukan' ? kategoriMasuk : tebakKategori(sisa, 'pengeluaran')
  const catatan = sisa.replace(/\s+/g, ' ').trim()

  return {
    data: {
      jenis,
      nominal: jumlah,
      kategori: kategori ?? 'Lainnya',
      tanggal,
      catatan: (catatan.charAt(0).toUpperCase() + catatan.slice(1)).slice(0, 100),
    },
    kategoriDitebak: !!kategori,
  }
}
