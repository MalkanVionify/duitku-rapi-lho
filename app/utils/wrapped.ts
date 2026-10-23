import { hitungRingkasan, pengeluaranPerKategori, type Transaksi } from '~/composables/useTransaksi'

export type ModeWrapped = 'bulan' | 'tahun'

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export const EMOJI_KATEGORI: Record<string, string> = {
  Makanan: '🍜', Transportasi: '🛵', Belanja: '🛍️', Tagihan: '🧾', Hiburan: '🎬',
  Kesehatan: '💊', Pendidikan: '📚', Gaji: '💼', Bonus: '🎁', Usaha: '🏪', Hadiah: '💝', Lainnya: '✨',
}

// Julukan berdasarkan kategori pengeluaran terbesar
const PERSONA: Record<string, { nama: string; emoji: string; deskripsi: string }> = {
  Makanan: { nama: 'Si Pecinta Kuliner', emoji: '🍜', deskripsi: 'Perut kenyang, hati senang. Uangmu paling sering mampir ke urusan makan.' },
  Transportasi: { nama: 'Si Penjelajah Kota', emoji: '🛵', deskripsi: 'Selalu di perjalanan. Bensin, ojek, dan parkir jadi teman setiamu.' },
  Belanja: { nama: 'Si Raja Checkout', emoji: '🛍️', deskripsi: 'Keranjang belanja tidak pernah sepi. Yang penting barangnya berguna ya!' },
  Tagihan: { nama: 'Si Taat Tagihan', emoji: '🧾', deskripsi: 'Tanggung jawab nomor satu. Tagihan beres, hidup tenang.' },
  Hiburan: { nama: 'Si Pencari Bahagia', emoji: '🎬', deskripsi: 'Kerja keras, main juga keras. Kamu tahu cara menikmati hidup.' },
  Kesehatan: { nama: 'Si Sehat Bugar', emoji: '💪', deskripsi: 'Investasi terbaikmu adalah kesehatan. Keren!' },
  Pendidikan: { nama: 'Si Pembelajar Sejati', emoji: '📚', deskripsi: 'Ilmu adalah investasi yang tidak pernah rugi.' },
  Lainnya: { nama: 'Si Serba Bisa', emoji: '✨', deskripsi: 'Pengeluaranmu beragam dan penuh kejutan.' },
}
const PERSONA_PENABUNG = { nama: 'Si Penabung Handal', emoji: '🐷', deskripsi: 'Lebih dari separuh pemasukanmu berhasil disisihkan. Luar biasa!' }

function geserHari(tanggal: string, hari: number) {
  const d = new Date(`${tanggal}T00:00:00`)
  d.setDate(d.getDate() + hari)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Rangkum transaksi satu periode (periode = "YYYY-MM" atau "YYYY") untuk ditampilkan sebagai Wrapped
export function hitungWrapped(semua: Transaksi[], mode: ModeWrapped, periode: string) {
  const list = semua.filter((t) => t.tanggal.startsWith(periode))
  if (list.length === 0) return null

  const ringkasan = hitungRingkasan(list)
  const keluar = list.filter((t) => t.jenis === 'pengeluaran')
  const masuk = list.filter((t) => t.jenis === 'pemasukan')
  const perKategori = pengeluaranPerKategori(list)

  // Pola pengeluaran: per hari dalam seminggu (bulanan) atau per bulan (tahunan)
  const pola =
    mode === 'bulan'
      ? HARI_PENDEK.map((label, i) => ({
          label,
          nama: NAMA_HARI[(i + 1) % 7]!,
          nominal: keluar
            .filter((t) => (new Date(`${t.tanggal}T00:00:00`).getDay() + 6) % 7 === i)
            .reduce((s, t) => s + t.nominal, 0),
        }))
      : BULAN_PENDEK.map((label, i) => ({
          label,
          nama: formatBulan(`${periode}-${String(i + 1).padStart(2, '0')}`).split(' ')[0]!,
          nominal: keluar.filter((t) => Number(t.tanggal.slice(5, 7)) === i + 1).reduce((s, t) => s + t.nominal, 0),
        }))
  const polaPuncak = pola.reduce((a, b) => (b.nominal > a.nominal ? b : a))

  // Rekor mencatat beberapa hari berturut-turut
  const tanggalUnik = [...new Set(list.map((t) => t.tanggal))].sort()
  let streak = 1
  let jalan = 1
  for (let i = 1; i < tanggalUnik.length; i++) {
    jalan = tanggalUnik[i] === geserHari(tanggalUnik[i - 1]!, 1) ? jalan + 1 : 1
    streak = Math.max(streak, jalan)
  }

  const terbesar = (l: Transaksi[]) => l.reduce<Transaksi | null>((a, b) => (!a || b.nominal > a.nominal ? b : a), null)
  const persenSisa = ringkasan.pemasukan > 0 ? Math.round((ringkasan.saldo / ringkasan.pemasukan) * 100) : null
  const kategoriTop = perKategori[0]?.kategori ?? 'Lainnya'
  const persona = persenSisa !== null && persenSisa >= 50 ? PERSONA_PENABUNG : PERSONA[kategoriTop] ?? PERSONA.Lainnya!

  return {
    judulPeriode: mode === 'bulan' ? formatBulan(periode) : `Tahun ${periode}`,
    jumlahTransaksi: list.length,
    jumlahHari: tanggalUnik.length,
    ...ringkasan,
    persenSisa,
    kategori: perKategori.slice(0, 3).map((k) => ({
      ...k,
      emoji: EMOJI_KATEGORI[k.kategori] ?? '✨',
      persen: Math.round((k.nominal / ringkasan.pengeluaran) * 100),
    })),
    pola,
    polaPuncak: polaPuncak.nominal > 0 ? polaPuncak : null,
    keluarTerbesar: terbesar(keluar),
    masukTerbesar: terbesar(masuk),
    streak,
    persona,
  }
}

export type DataWrapped = NonNullable<ReturnType<typeof hitungWrapped>>
