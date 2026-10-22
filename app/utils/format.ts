const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(nominal: number) {
  return rupiah.format(nominal)
}

export function formatTanggal(tanggal: string) {
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatBulan(bulan: string) {
  return new Date(`${bulan}-01T00:00:00`).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}

// Tanggal hari ini (zona waktu lokal) dalam format YYYY-MM-DD
export function hariIni() {
  const d = new Date()
  const bulan = String(d.getMonth() + 1).padStart(2, '0')
  const tanggal = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${bulan}-${tanggal}`
}

// Bulan ini dalam format YYYY-MM
export function bulanIni() {
  return hariIni().slice(0, 7)
}
