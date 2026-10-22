<script setup lang="ts">
import { hitungRingkasan, pengeluaranPerKategori, useTransaksi } from '~/composables/useTransaksi'

useHead({ title: 'Dashboard · Duitku Rapi Lho' })

const { terurut } = useTransaksi()
const bulan = bulanIni()

const transaksiBulanIni = computed(() => terurut.value.filter((t) => t.tanggal.startsWith(bulan)))
const ringkasan = computed(() => hitungRingkasan(transaksiBulanIni.value))
const terbaru = computed(() => terurut.value.slice(0, 5))

// Pengeluaran bulan ini per kategori, lengkap dengan persen & lebar batang
const perKategori = computed(() => {
  const data = pengeluaranPerKategori(transaksiBulanIni.value)
  const terbesar = data[0]?.nominal ?? 1
  return data.map((k) => ({
    ...k,
    persen: Math.round((k.nominal / ringkasan.value.pengeluaran) * 100),
    lebar: (k.nominal / terbesar) * 100,
  }))
})
</script>

<template>
  <section>
    <h1 class="sapaan">Ringkasan {{ formatBulan(bulan) }}</h1>
    <KartuRingkasan v-bind="ringkasan" />
  </section>

  <div class="grid">
    <section class="kartu">
      <div class="judul-bagian">
        <h2>Pengeluaran per Kategori</h2>
      </div>
      <p v-if="perKategori.length === 0" class="kosong">Belum ada pengeluaran bulan ini.</p>
      <ul v-else class="daftar batang">
        <li v-for="k in perKategori" :key="k.kategori">
          <div class="batang-label">
            <span>{{ k.kategori }} <small>({{ k.persen }}%)</small></span>
            <strong>{{ formatRupiah(k.nominal) }}</strong>
          </div>
          <div class="batang-latar">
            <div class="batang-isi" :style="{ width: `${k.lebar}%` }" />
          </div>
        </li>
      </ul>
    </section>

    <section class="kartu">
      <div class="judul-bagian">
        <h2>Transaksi Terbaru</h2>
        <NuxtLink to="/transaksi">Lihat semua →</NuxtLink>
      </div>
      <p v-if="terbaru.length === 0" class="kosong">
        Belum ada transaksi.<br>
        <NuxtLink to="/transaksi">Tambah transaksi pertamamu</NuxtLink>
      </p>
      <ul v-else class="daftar">
        <TransaksiItem v-for="t in terbaru" :key="t.id" :transaksi="t" />
      </ul>
    </section>
  </div>
</template>

<style scoped>
.sapaan { font-size: 1.3rem; margin: 0 0 12px; }
.grid { display: grid; gap: 20px; }
@media (min-width: 720px) { .grid { grid-template-columns: 1fr 1fr; align-items: start; } }
.judul-bagian a { color: var(--sorot); font-size: 0.9rem; text-decoration: none; }
.kosong a { color: var(--sorot); }
.batang li { margin-bottom: 12px; }
.batang-label { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px; }
.batang-label small { color: var(--teks-redup); }
.batang-latar { height: 8px; border-radius: 99px; background: var(--latar); overflow: hidden; }
.batang-isi { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--hiasan-b), var(--hiasan-a)); }
</style>
