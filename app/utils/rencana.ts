import { hitungRingkasan, type Transaksi } from '~/composables/useTransaksi'
import type { DanaRutin, Target } from '~/composables/useRencana'

export type StatusRutin = 'lunas' | 'terlambat' | 'hari-ini' | 'segera' | 'nanti'

function selisihHari(dari: string, ke: string) {
  return Math.round((new Date(`${ke}T00:00:00`).getTime() - new Date(`${dari}T00:00:00`).getTime()) / 86_400_000)
}

// Dana rutin dianggap lunas bulan ini kalau ada pengeluaran bulan ini dengan catatan yang sama
export function sudahDibayar(r: DanaRutin, transaksi: Transaksi[], bulan: string) {
  const nama = r.nama.trim().toLowerCase()
  return transaksi.some(
    (t) => t.jenis === 'pengeluaran' && t.tanggal.startsWith(bulan) && t.catatan.trim().toLowerCase() === nama,
  )
}

// Status setiap dana rutin bulan ini, diurutkan: terlambat → hari ini → segera → nanti → lunas
export function statusRutin(rutin: DanaRutin[], transaksi: Transaksi[], hari = hariIni()) {
  const bulan = hari.slice(0, 7)
  const [t, b] = bulan.split('-').map(Number)
  const jumlahHari = new Date(t!, b!, 0).getDate()
  const urutan: Record<StatusRutin, number> = { terlambat: 0, 'hari-ini': 1, segera: 2, nanti: 3, lunas: 4 }

  return rutin
    .map((r) => {
      // Tanggal 31 di bulan yang cuma 30 hari → jatuh tempo di hari terakhir bulan itu
      const jatuhTempo = `${bulan}-${String(Math.min(r.tanggal, jumlahHari)).padStart(2, '0')}`
      const sisaHari = selisihHari(hari, jatuhTempo)
      const lunas = sudahDibayar(r, transaksi, bulan)
      const status: StatusRutin = lunas
        ? 'lunas'
        : sisaHari < 0 ? 'terlambat' : sisaHari === 0 ? 'hari-ini' : sisaHari <= 3 ? 'segera' : 'nanti'
      return { ...r, jatuhTempo, sisaHari, status }
    })
    .sort((a, b) => urutan[a.status] - urutan[b.status] || a.sisaHari - b.sisaHari)
}

export type RutinBerstatus = ReturnType<typeof statusRutin>[number]

export function labelStatus(r: RutinBerstatus) {
  switch (r.status) {
    case 'lunas': return 'Lunas ✓'
    case 'terlambat': return `Terlambat ${-r.sisaHari} hari`
    case 'hari-ini': return 'Jatuh tempo hari ini'
    case 'segera': return `${r.sisaHari} hari lagi`
    default: return `Tgl ${Number(r.jatuhTempo.slice(8))}`
  }
}

// Progres target tabungan & batas pengeluaran per kategori bulan ini.
// Tabungan dihitung dari perkiraan sisa setelah dana rutin yang belum dibayar disisihkan,
// supaya angkanya sama dengan Proyeksi.
export function progresTarget(target: Target[], rutin: DanaRutin[], transaksi: Transaksi[], hari = hariIni()) {
  const bulan = hari.slice(0, 7)
  const bulanIni_ = transaksi.filter((t) => t.tanggal.startsWith(bulan))
  const rutinBelumBayar = statusRutin(rutin, transaksi, hari)
    .filter((r) => r.status !== 'lunas')
    .reduce((s, r) => s + r.nominal, 0)
  const saldo = hitungRingkasan(bulanIni_).saldo - rutinBelumBayar

  const tabungan = target.find((t) => t.jenis === 'tabungan')
  const batas = target
    .filter((t) => t.jenis === 'batas')
    .map((t) => {
      const terpakai = bulanIni_
        .filter((x) => x.jenis === 'pengeluaran' && x.kategori === t.kategori)
        .reduce((s, x) => s + x.nominal, 0)
      const persen = Math.round((terpakai / t.nominal) * 100)
      return { ...t, terpakai, persen, tingkat: persen > 100 ? 'lewat' : persen >= 80 ? 'waspada' : 'aman' }
    })
    .sort((a, b) => b.persen - a.persen)

  return {
    tabungan: tabungan
      ? { ...tabungan, terkumpul: saldo, persen: Math.max(0, Math.round((saldo / tabungan.nominal) * 100)) }
      : null,
    batas,
  }
}

// Proyeksi: sisa akhir bulan ini + rencana bulanan dari rata-rata 3 bulan terakhir
export function proyeksi(target: Target[], rutin: DanaRutin[], transaksi: Transaksi[], hari = hariIni()) {
  const bulan = hari.slice(0, 7)
  const ringkasBulanIni = hitungRingkasan(transaksi.filter((t) => t.tanggal.startsWith(bulan)))
  const rutinBelumBayar = statusRutin(rutin, transaksi, hari)
    .filter((r) => r.status !== 'lunas')
    .reduce((s, r) => s + r.nominal, 0)
  const sisaAkhirBulan = ringkasBulanIni.saldo - rutinBelumBayar

  // Rata-rata 3 bulan lengkap terakhir yang punya data (kalau belum ada, pakai bulan ini)
  const [t, b] = bulan.split('-').map(Number)
  const bulanLalu = [1, 2, 3].map((n) => {
    const d = new Date(t!, b! - 1 - n, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const riwayat = bulanLalu
    .map((bl) => hitungRingkasan(transaksi.filter((x) => x.tanggal.startsWith(bl))))
    .filter((r) => r.pemasukan || r.pengeluaran)
  const dasar = riwayat.length ? riwayat : [ringkasBulanIni]
  const rata = (k: 'pemasukan' | 'saldo') => Math.round(dasar.reduce((s, r) => s + r[k], 0) / dasar.length)

  const totalRutin = rutin.reduce((s, r) => s + r.nominal, 0)
  const targetTabungan = target.find((x) => x.jenis === 'tabungan')?.nominal ?? 0
  const pemasukanRata = rata('pemasukan')
  const danaBebas = pemasukanRata - totalRutin - targetTabungan
  const selisihRata = rata('saldo')

  const jumlahHari = new Date(t!, b!, 0).getDate()
  const sisaHari = jumlahHari - Number(hari.slice(8)) + 1

  return {
    sisaAkhirBulan,
    rutinBelumBayar,
    targetTabungan,
    totalRutin,
    pemasukanRata,
    danaBebas,
    jatahHarian: Math.max(0, Math.round(danaBebas / 30)),
    // Jatah per hari untuk sisa bulan ini setelah rutin & target tabungan disisihkan
    jatahHarianBulanIni: Math.max(0, Math.round((sisaAkhirBulan - targetTabungan) / sisaHari)),
    sisaHari,
    dasarBulan: riwayat.length,
    tabunganKedepan: [3, 6, 12].map((n) => ({ bulan: n, nominal: selisihRata * n })),
  }
}
