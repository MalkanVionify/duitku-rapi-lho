export type JenisTransaksi = 'pemasukan' | 'pengeluaran'

export interface Transaksi {
  id: string
  jenis: JenisTransaksi
  nominal: number
  kategori: string
  tanggal: string // format YYYY-MM-DD
  catatan: string
}

export type DataTransaksi = Omit<Transaksi, 'id'>

export const KATEGORI: Record<JenisTransaksi, string[]> = {
  pemasukan: ['Gaji', 'Bonus', 'Usaha', 'Hadiah', 'Lainnya'],
  pengeluaran: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya'],
}

const KUNCI_STORAGE = 'duitku-rapi-lho:transaksi'

function muatDariStorage(): Transaksi[] {
  try {
    const isi = localStorage.getItem(KUNCI_STORAGE)
    return isi ? JSON.parse(isi) : []
  } catch {
    return []
  }
}

export function useTransaksi() {
  // useState membuat data ini dipakai bersama oleh semua halaman & komponen
  const daftar = useState<Transaksi[]>('transaksi', muatDariStorage)

  function simpan() {
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftar.value))
  }

  function tambah(data: DataTransaksi) {
    daftar.value.push({ ...data, id: crypto.randomUUID() })
    simpan()
  }

  function ubah(id: string, data: DataTransaksi) {
    const index = daftar.value.findIndex((t) => t.id === id)
    if (index === -1) return
    daftar.value[index] = { ...data, id }
    simpan()
  }

  function hapus(id: string) {
    daftar.value = daftar.value.filter((t) => t.id !== id)
    simpan()
  }

  // Urutkan dari tanggal terbaru
  const terurut = computed(() =>
    [...daftar.value].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
  )

  return { daftar, terurut, tambah, ubah, hapus }
}

// Hitung total pemasukan, pengeluaran, dan saldo dari daftar transaksi
export function hitungRingkasan(list: Transaksi[]) {
  let pemasukan = 0
  let pengeluaran = 0
  for (const t of list) {
    if (t.jenis === 'pemasukan') pemasukan += t.nominal
    else pengeluaran += t.nominal
  }
  return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran }
}

// Total pengeluaran per kategori, diurutkan dari yang terbesar
export function pengeluaranPerKategori(list: Transaksi[]) {
  const total: Record<string, number> = {}
  for (const t of list) {
    if (t.jenis === 'pengeluaran') total[t.kategori] = (total[t.kategori] ?? 0) + t.nominal
  }
  return Object.entries(total)
    .map(([kategori, nominal]) => ({ kategori, nominal }))
    .sort((a, b) => b.nominal - a.nominal)
}
