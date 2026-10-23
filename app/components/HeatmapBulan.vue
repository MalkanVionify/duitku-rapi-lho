<script setup lang="ts">
import type { JenisTransaksi, Transaksi } from '~/composables/useTransaksi'

const props = defineProps<{ transaksi: Transaksi[]; bulanAwal: string }>()

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
// Persentase warna di tiap tingkat (0 = tidak ada transaksi)
const TINGKAT = [0, 22, 45, 70, 100]

const bulan = ref(props.bulanAwal)
const jenis = ref<JenisTransaksi>('pengeluaran')
const dipilih = ref<string | null>(null)

function geserBulan(arah: number) {
  const [t, b] = bulan.value.split('-').map(Number)
  const d = new Date(t!, b! - 1 + arah, 1)
  bulan.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  dipilih.value = null
}

const transaksiBulan = computed(() =>
  props.transaksi.filter((t) => t.jenis === jenis.value && t.tanggal.startsWith(bulan.value)),
)

const totalPerTanggal = computed(() => {
  const total: Record<string, number> = {}
  for (const t of transaksiBulan.value) total[t.tanggal] = (total[t.tanggal] ?? 0) + t.nominal
  return total
})

// Sel kalender: diawali sel kosong supaya tanggal 1 jatuh di hari yang benar (minggu dimulai Senin)
const sel = computed(() => {
  const [t, b] = bulan.value.split('-').map(Number)
  const jumlahHari = new Date(t!, b!, 0).getDate()
  const geser = (new Date(t!, b! - 1, 1).getDay() + 6) % 7
  const terbesar = Math.max(0, ...Object.values(totalPerTanggal.value))
  const hasil: ({ tanggal: string; hari: number; total: number; tingkat: number } | null)[] = Array(geser).fill(null)
  for (let hari = 1; hari <= jumlahHari; hari++) {
    const tanggal = `${bulan.value}-${String(hari).padStart(2, '0')}`
    const total = totalPerTanggal.value[tanggal] ?? 0
    // Skala akar kuadrat: satu transaksi raksasa tidak membuat hari lain tampak pucat semua
    hasil.push({ tanggal, hari, total, tingkat: total ? Math.max(1, Math.ceil(Math.sqrt(total / terbesar) * 4)) : 0 })
  }
  return hasil
})

const total = computed(() => transaksiBulan.value.reduce((s, t) => s + t.nominal, 0))
const puncak = computed(() => {
  const [tanggal, nominal] = Object.entries(totalPerTanggal.value).sort((a, b) => b[1] - a[1])[0] ?? []
  return tanggal ? { tanggal, nominal: nominal! } : null
})
const rincian = computed(() => transaksiBulan.value.filter((t) => t.tanggal === dipilih.value))

function warna(tingkat: number) {
  if (!tingkat) return undefined
  const dasar = jenis.value === 'pengeluaran' ? 'var(--merah)' : 'var(--hijau)'
  return `color-mix(in srgb, ${dasar} ${TINGKAT[tingkat]}%, var(--kartu))`
}

const hariIni_ = hariIni()
</script>

<template>
  <section class="kartu heatmap">
    <div class="judul-bagian">
      <h2>Heatmap {{ jenis === 'pengeluaran' ? 'Pengeluaran' : 'Pemasukan' }}</h2>
      <div class="navigasi">
        <button type="button" aria-label="Bulan sebelumnya" @click="geserBulan(-1)">‹</button>
        <span>{{ formatBulan(bulan) }}</span>
        <button type="button" aria-label="Bulan berikutnya" @click="geserBulan(1)">›</button>
      </div>
    </div>

    <div class="pilihan" role="tablist">
      <button
        v-for="j in (['pengeluaran', 'pemasukan'] as const)"
        :key="j"
        type="button"
        role="tab"
        :aria-selected="jenis === j"
        :class="[j, { aktif: jenis === j }]"
        @click="jenis = j; dipilih = null"
      >
        {{ j === 'pengeluaran' ? 'Pengeluaran' : 'Pemasukan' }}
      </button>
    </div>

    <div class="kalender">
      <span v-for="h in NAMA_HARI" :key="h" class="nama-hari">{{ h }}</span>
      <template v-for="(s, i) in sel" :key="s?.tanggal ?? `kosong-${i}`">
        <span v-if="!s" />
        <button
          v-else
          type="button"
          class="hari"
          :class="[`t${s.tingkat}`, { 'hari-ini': s.tanggal === hariIni_, dipilih: s.tanggal === dipilih }]"
          :style="{ background: warna(s.tingkat) }"
          :title="`${formatTanggal(s.tanggal)}: ${formatRupiah(s.total)}`"
          @click="dipilih = dipilih === s.tanggal ? null : s.tanggal"
        >
          {{ s.hari }}
        </button>
      </template>
    </div>

    <div class="legenda">
      <span>Sedikit</span>
      <i v-for="t in [1, 2, 3, 4]" :key="t" :style="{ background: warna(t) }" />
      <span>Banyak</span>
    </div>

    <p class="ringkas">
      Total <strong>{{ formatRupiah(total) }}</strong>
      <template v-if="puncak"> · Tertinggi {{ formatTanggal(puncak.tanggal) }} ({{ formatRupiah(puncak.nominal) }})</template>
    </p>

    <div v-if="dipilih" class="rincian">
      <strong>{{ formatTanggal(dipilih) }}</strong>
      <p v-if="rincian.length === 0" class="kosong-kecil">Tidak ada {{ jenis }} di tanggal ini.</p>
      <ul v-else class="daftar">
        <li v-for="t in rincian" :key="t.id">
          <span>{{ t.catatan || t.kategori }} <small>· {{ t.kategori }}</small></span>
          <strong :class="jenis">{{ formatRupiah(t.nominal) }}</strong>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.heatmap h2 { font-size: 1.05rem; }
.navigasi { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; white-space: nowrap; }
.navigasi button {
  width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--garis);
  background: var(--kartu); color: var(--teks); cursor: pointer; font-size: 1rem; line-height: 1;
}
.pilihan { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px; }
.pilihan button {
  font: inherit; font-size: 0.85rem; font-weight: 600; padding: 6px; border-radius: 8px; cursor: pointer;
  border: 1px solid var(--garis); background: var(--latar); color: var(--teks-redup);
}
.pilihan button.aktif.pengeluaran { background: var(--merah-muda); color: var(--merah); border-color: var(--merah); }
.pilihan button.aktif.pemasukan { background: var(--hijau-muda); color: var(--hijau); border-color: var(--hijau); }
.kalender { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.nama-hari { font-size: 0.7rem; color: var(--teks-redup); text-align: center; padding-bottom: 2px; }
.hari {
  aspect-ratio: 1; border-radius: 8px; border: 1px solid var(--garis); background: var(--latar);
  color: var(--teks-redup); font: inherit; font-size: 0.75rem; cursor: pointer; padding: 0;
}
/* Warna angka disesuaikan supaya tetap terbaca di atas warna sel */
.hari:not(.t0) { color: var(--teks); font-weight: 600; border-color: transparent; }
.hari.t4 { color: #fff; font-weight: 700; }
:global([data-theme='dark']) .hari.t3, :global([data-theme='dark']) .hari.t4 { color: #090c0e; }
.hari.hari-ini { outline: 2px solid var(--sorot); outline-offset: 1px; }
.hari.dipilih { outline: 2px solid var(--teks); outline-offset: 1px; }
/* Desktop: kolom lebar, jadi sel melebar dengan tinggi tetap (tidak jadi kotak raksasa) */
@media (min-width: 1024px) { .hari { aspect-ratio: auto; height: 52px; } }
.legenda { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 10px; font-size: 0.7rem; color: var(--teks-redup); }
.legenda i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
.ringkas { font-size: 0.85rem; color: var(--teks-redup); margin: 8px 0 0; }
.ringkas strong { color: var(--teks); }
.rincian { margin-top: 12px; padding: 10px 12px; background: var(--latar); border-radius: 10px; font-size: 0.85rem; }
.rincian li { display: flex; justify-content: space-between; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--garis); }
.rincian li:last-child { border-bottom: none; }
.rincian small { color: var(--teks-redup); }
.rincian .pengeluaran { color: var(--merah); }
.rincian .pemasukan { color: var(--hijau); }
.kosong-kecil { margin: 6px 0 0; color: var(--teks-redup); }
</style>
