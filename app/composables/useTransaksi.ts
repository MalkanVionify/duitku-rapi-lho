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
const KOLOM = 'id, jenis, nominal, kategori, tanggal, catatan'

function muatLokal(): Transaksi[] {
  try {
    const isi = localStorage.getItem(KUNCI_STORAGE)
    return isi ? JSON.parse(isi) : []
  } catch {
    return []
  }
}

function simpanLokal(list: Transaksi[]) {
  if (list.length) localStorage.setItem(KUNCI_STORAGE, JSON.stringify(list))
  else localStorage.removeItem(KUNCI_STORAGE)
}

// Sumber data otomatis dipilih:
// - belum login → localStorage di browser ini
// - sudah login → tabel "transaksi" di Supabase
export function useTransaksi() {
  // useState membuat data ini dipakai bersama oleh semua halaman & komponen
  const daftar = useState<Transaksi[]>('transaksi', () => [])
  const memuat = useState('transaksi-memuat', () => false)
  // Jumlah transaksi lokal yang belum dipindahkan ke akun (dipakai saat sudah login)
  const jumlahLokal = useState('transaksi-lokal', () => 0)

  const supabase = useSupabase()
  const user = useUser()
  const online = () => !!(supabase && user.value)

  async function muatUlang() {
    const lokal = muatLokal()
    if (!online()) {
      daftar.value = lokal
      jumlahLokal.value = 0
      return
    }
    jumlahLokal.value = lokal.length
    memuat.value = true
    try {
      const { data, error } = await supabase!.from('transaksi').select(KOLOM)
      if (error) throw error
      daftar.value = data
    } catch (e) {
      console.error(e)
      alert('Gagal memuat data dari server.')
    } finally {
      memuat.value = false
    }
  }

  async function tambah(data: DataTransaksi) {
    const baru: Transaksi = { ...data, id: crypto.randomUUID() }
    if (online()) {
      const { error } = await supabase!.from('transaksi').insert(baru)
      if (error) throw error
    }
    daftar.value.push(baru)
    if (!online()) simpanLokal(daftar.value)
  }

  async function ubah(id: string, data: DataTransaksi) {
    if (online()) {
      const { error } = await supabase!.from('transaksi').update(data).eq('id', id)
      if (error) throw error
    }
    const index = daftar.value.findIndex((t) => t.id === id)
    if (index !== -1) daftar.value[index] = { ...data, id }
    if (!online()) simpanLokal(daftar.value)
  }

  async function hapus(id: string) {
    if (online()) {
      const { error } = await supabase!.from('transaksi').delete().eq('id', id)
      if (error) throw error
    }
    daftar.value = daftar.value.filter((t) => t.id !== id)
    if (!online()) simpanLokal(daftar.value)
  }

  // Pindahkan transaksi dari localStorage ke akun Supabase, lalu hapus salinan lokalnya
  async function pindahkanKeAkun() {
    if (!online()) return
    const { error } = await supabase!.from('transaksi').upsert(muatLokal(), { onConflict: 'id' })
    if (error) throw error
    simpanLokal([])
    await muatUlang()
  }

  // Urutkan dari tanggal terbaru
  const terurut = computed(() =>
    [...daftar.value].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
  )

  return { daftar, terurut, memuat, jumlahLokal, muatUlang, tambah, ubah, hapus, pindahkanKeAkun }
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
