<script setup lang="ts">
import { useTransaksi } from '~/composables/useTransaksi'
import { useRencana, type DanaRutin } from '~/composables/useRencana'

const { terurut, tambah } = useTransaksi()
const { target, rutin, belumSiap } = useRencana()

const progres = computed(() => progresTarget(target.value, rutin.value, terurut.value))
// Pengingat: maksimal 3 dana rutin yang belum lunas, yang paling mendesak dulu
const pengingat = computed(() => statusRutin(rutin.value, terurut.value).filter((r) => r.status !== 'lunas').slice(0, 3))
const sisa = computed(() => proyeksi(target.value, rutin.value, terurut.value).sisaAkhirBulan)
const kosong = computed(() => !target.value.length && !rutin.value.length)

async function bayar(r: DanaRutin) {
  try {
    await tambah({ jenis: 'pengeluaran', nominal: r.nominal, kategori: r.kategori, tanggal: hariIni(), catatan: r.nama })
  } catch (e) {
    console.error(e)
    alert('Gagal mencatat pembayaran. Coba lagi ya.')
  }
}
</script>

<template>
  <section class="kartu rencana">
    <div class="judul-bagian">
      <h2>🎯 Target &amp; Pengingat</h2>
      <NuxtLink to="/target">Kelola →</NuxtLink>
    </div>

    <p v-if="belumSiap" class="kosong-kecil">Menu Target perlu disiapkan dulu. <NuxtLink to="/target">Siapkan sekarang</NuxtLink></p>
    <p v-else-if="kosong" class="kosong-kecil">
      Belum ada target atau dana rutin.<br>
      <NuxtLink to="/target">Buat target bulanan pertamamu</NuxtLink>
    </p>

    <template v-else>
      <!-- Pengingat dana rutin -->
      <ul v-if="pengingat.length" class="pengingat">
        <li v-for="r in pengingat" :key="r.id" :class="r.status">
          <span class="lonceng" aria-hidden="true">🔔</span>
          <div class="info">
            <strong>{{ r.nama }} · {{ formatRupiah(r.nominal) }}</strong>
            <small :class="r.status">{{ labelStatus(r) }}</small>
          </div>
          <button class="tombol kecil" @click="bayar(r)">Bayar</button>
        </li>
      </ul>
      <p v-else-if="rutin.length" class="semua-lunas">✅ Semua dana rutin bulan ini sudah lunas.</p>

      <!-- Target tabungan -->
      <div v-if="progres.tabungan" class="baris">
        <div class="label">
          <span>🐷 Tabungan</span>
          <span><strong>{{ formatRupiah(Math.max(0, progres.tabungan.terkumpul)) }}</strong> / {{ formatRupiah(progres.tabungan.nominal) }}</span>
        </div>
        <div class="latar"><div class="isi tabungan" :style="{ width: `${Math.min(100, progres.tabungan.persen)}%` }" /></div>
      </div>

      <!-- Batas pengeluaran (3 yang paling mendekati batas) -->
      <div v-for="b in progres.batas.slice(0, 3)" :key="b.id" class="baris">
        <div class="label">
          <span>{{ EMOJI_KATEGORI[b.kategori] }} {{ b.kategori }}</span>
          <span><strong :class="b.tingkat">{{ b.persen }}%</strong> dari {{ formatRupiah(b.nominal) }}</span>
        </div>
        <div class="latar"><div class="isi" :class="b.tingkat" :style="{ width: `${Math.min(100, b.persen)}%` }" /></div>
      </div>

      <p class="perkiraan">
        Perkiraan sisa akhir bulan
        <strong :class="sisa >= 0 ? 'plus' : 'minus'">{{ formatRupiah(sisa) }}</strong>
      </p>
    </template>
  </section>
</template>

<style scoped>
.rencana h2 { font-size: 1.05rem; }
.judul-bagian a { color: var(--sorot); font-size: 0.9rem; text-decoration: none; }
.kosong-kecil { color: var(--teks-redup); text-align: center; margin: 12px 0; font-size: 0.9rem; }
.kosong-kecil a { color: var(--sorot); }
.pengingat { list-style: none; padding: 0; margin: 0 0 12px; display: grid; gap: 8px; }
.pengingat li {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px;
  background: var(--latar); border-left: 3px solid var(--garis);
}
.pengingat li.terlambat, .pengingat li.hari-ini { border-left-color: var(--merah); }
.pengingat li.segera { border-left-color: var(--kuning); }
.pengingat .info { flex: 1; display: flex; flex-direction: column; font-size: 0.9rem; }
.pengingat small { color: var(--teks-redup); font-weight: 600; }
.pengingat small.terlambat, .pengingat small.hari-ini { color: var(--merah); }
.pengingat small.segera { color: var(--kuning); }
.tombol.kecil { padding: 5px 12px; font-size: 0.8rem; }
.semua-lunas { font-size: 0.9rem; color: var(--hijau); margin: 0 0 12px; }
.baris { margin-bottom: 12px; }
.label { display: flex; justify-content: space-between; gap: 8px; font-size: 0.9rem; margin-bottom: 4px; }
.label span:last-child { color: var(--teks-redup); }
.label strong { color: var(--teks); }
.latar { height: 8px; border-radius: 99px; background: var(--latar); overflow: hidden; }
.isi { height: 100%; border-radius: 99px; background: var(--hijau); }
.isi.tabungan { background: linear-gradient(90deg, var(--hiasan-b), var(--hiasan-a)); }
.isi.waspada { background: var(--kuning); }
.isi.lewat { background: var(--merah); }
strong.waspada { color: var(--kuning); }
strong.lewat { color: var(--merah); }
.perkiraan {
  display: flex; justify-content: space-between; gap: 8px; margin: 4px 0 0; padding-top: 10px;
  border-top: 1px dashed var(--garis); font-size: 0.9rem; color: var(--teks-redup);
}
.plus { color: var(--hijau); }
.minus { color: var(--merah); }
</style>
