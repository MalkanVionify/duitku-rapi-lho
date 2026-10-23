<script setup lang="ts">
import { useTransaksi } from '~/composables/useTransaksi'

const { tambah } = useTransaksi()

const CONTOH = ['bakso 15rb kemarin', 'gaji 8jt', 'bensin 50k', 'listrik 500rb tgl 5']

const kalimat = ref('')
const menyimpan = ref(false)
const pesan = ref<{ jenis: 'ok' | 'error'; teks: string } | null>(null)
let timerPesan: ReturnType<typeof setTimeout> | undefined

const hasil = computed(() => bacaKetikCepat(kalimat.value))

function tampilkanPesan(jenis: 'ok' | 'error', teks: string) {
  pesan.value = { jenis, teks }
  clearTimeout(timerPesan)
  timerPesan = setTimeout(() => (pesan.value = null), 3000)
}

async function simpan() {
  if (!kalimat.value.trim()) return
  if (!hasil.value) {
    tampilkanPesan('error', 'Nominalnya belum ada. Contoh: "bakso 15rb"')
    return
  }
  menyimpan.value = true
  try {
    await tambah(hasil.value.data)
    tampilkanPesan('ok', `Tersimpan: ${hasil.value.data.catatan || hasil.value.data.kategori} ${formatRupiah(hasil.value.data.nominal)}`)
    kalimat.value = ''
  } catch (e) {
    console.error(e)
    tampilkanPesan('error', 'Gagal menyimpan. Coba lagi ya.')
  } finally {
    menyimpan.value = false
  }
}
</script>

<template>
  <form class="kartu ketik-cepat" @submit.prevent="simpan">
    <div class="judul">
      <h2>⚡ Ketik Cepat</h2>
      <small>Tekan Enter untuk simpan</small>
    </div>

    <input
      v-model="kalimat"
      type="text"
      maxlength="120"
      placeholder="Contoh: bakso 15rb kemarin"
      aria-label="Ketik transaksi, misalnya bakso 15rb kemarin"
      enterkeyhint="done"
      :disabled="menyimpan"
    >

    <!-- Pratinjau hasil bacaan -->
    <div v-if="hasil" class="pratinjau">
      <span class="chip" :class="hasil.data.jenis">{{ hasil.data.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran' }}</span>
      <span class="chip" :class="{ redup: !hasil.kategoriDitebak }">{{ hasil.data.kategori }}</span>
      <span class="chip tebal">{{ formatRupiah(hasil.data.nominal) }}</span>
      <span class="chip">{{ formatTanggal(hasil.data.tanggal) }}</span>
    </div>
    <p v-else-if="pesan" class="pesan" :class="pesan.jenis">{{ pesan.teks }}</p>
    <div v-else class="contoh">
      <button v-for="c in CONTOH" :key="c" type="button" @click="kalimat = c">{{ c }}</button>
    </div>
  </form>
</template>

<style scoped>
.ketik-cepat { display: flex; flex-direction: column; gap: 10px; }
.judul { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.judul h2 { margin: 0; font-size: 1.1rem; }
.judul small { color: var(--teks-redup); font-size: 0.8rem; }
.pratinjau, .contoh { display: flex; flex-wrap: wrap; gap: 6px; min-height: 28px; }
.chip {
  font-size: 0.8rem; padding: 3px 10px; border-radius: 99px;
  background: var(--latar); border: 1px solid var(--garis); color: var(--teks);
}
.chip.pengeluaran { background: var(--merah-muda); color: var(--merah); border-color: transparent; font-weight: 600; }
.chip.pemasukan { background: var(--hijau-muda); color: var(--hijau); border-color: transparent; font-weight: 600; }
.chip.redup { color: var(--teks-redup); border-style: dashed; }
.chip.tebal { font-weight: 700; }
.contoh button {
  font: inherit; font-size: 0.8rem; padding: 3px 10px; border-radius: 99px; cursor: pointer;
  background: none; border: 1px dashed var(--garis); color: var(--teks-redup);
}
.contoh button:hover { border-color: var(--sorot); color: var(--sorot); }
.pesan { margin: 0; font-size: 0.85rem; min-height: 28px; display: flex; align-items: center; }
.pesan.ok { color: var(--hijau); }
.pesan.error { color: var(--merah); }
</style>
