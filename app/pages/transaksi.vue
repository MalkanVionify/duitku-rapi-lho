<script setup lang="ts">
import { KATEGORI, hitungRingkasan, useTransaksi, type DataTransaksi, type Transaksi } from '~/composables/useTransaksi'

useHead({ title: 'Transaksi · Duitku Rapi Lho' })

const { terurut, tambah, ubah, hapus } = useTransaksi()

// --- Form tambah / edit ---
const sedangDiedit = ref<Transaksi | null>(null)

function simpan(data: DataTransaksi) {
  if (sedangDiedit.value) {
    ubah(sedangDiedit.value.id, data)
    sedangDiedit.value = null
  } else {
    tambah(data)
  }
}

function mulaiEdit(t: Transaksi) {
  sedangDiedit.value = t
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function konfirmasiHapus(t: Transaksi) {
  if (confirm(`Hapus transaksi "${t.catatan || t.kategori}"?`)) {
    hapus(t.id)
    if (sedangDiedit.value?.id === t.id) sedangDiedit.value = null
  }
}

// --- Filter ---
const filterBulan = ref(bulanIni())
const filterJenis = ref<'' | 'pemasukan' | 'pengeluaran'>('')
const filterKategori = ref('')

const semuaKategori = computed(() =>
  filterJenis.value ? KATEGORI[filterJenis.value] : [...new Set([...KATEGORI.pemasukan, ...KATEGORI.pengeluaran])],
)

watch(filterJenis, () => {
  if (filterKategori.value && !semuaKategori.value.includes(filterKategori.value)) filterKategori.value = ''
})

const hasilFilter = computed(() =>
  terurut.value.filter(
    (t) =>
      (!filterBulan.value || t.tanggal.startsWith(filterBulan.value)) &&
      (!filterJenis.value || t.jenis === filterJenis.value) &&
      (!filterKategori.value || t.kategori === filterKategori.value),
  ),
)

const ringkasan = computed(() => hitungRingkasan(hasilFilter.value))

// --- Export ke Excel ---
const sedangExport = ref(false)

async function export_() {
  sedangExport.value = true
  try {
    const keterangan = [
      filterBulan.value ? formatBulan(filterBulan.value) : 'Semua waktu',
      filterJenis.value && (filterJenis.value === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'),
      filterKategori.value,
    ].filter(Boolean)

    await exportExcel({
      transaksi: hasilFilter.value,
      semua: terurut.value,
      periode: keterangan.join(' · '),
      bulanAkhir: filterBulan.value || bulanIni(),
      namaFile: `duitku-rapi-lho_${filterBulan.value || 'semua'}.xlsx`,
    })
  } catch (e) {
    console.error(e)
    alert('Gagal membuat file Excel. Coba lagi ya.')
  } finally {
    sedangExport.value = false
  }
}
</script>

<template>
  <div class="tata-letak">
    <TransaksiForm :edit="sedangDiedit" @simpan="simpan" @batal="sedangDiedit = null" />

    <section class="kartu">
      <div class="judul-bagian">
        <div>
          <h2>Daftar Transaksi</h2>
          <small class="jumlah">{{ hasilFilter.length }} transaksi</small>
        </div>
        <button class="tombol tombol-excel" :disabled="sedangExport || hasilFilter.length === 0" @click="export_">
          {{ sedangExport ? 'Membuat file…' : '⬇ Export Excel' }}
        </button>
      </div>

      <div class="filter">
        <label>
          Bulan
          <input v-model="filterBulan" type="month">
        </label>
        <label>
          Jenis
          <select v-model="filterJenis">
            <option value="">Semua</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
        </label>
        <label>
          Kategori
          <select v-model="filterKategori">
            <option value="">Semua</option>
            <option v-for="k in semuaKategori" :key="k" :value="k">{{ k }}</option>
          </select>
        </label>
      </div>

      <div class="mini-ringkasan">
        <span>Masuk <strong class="masuk">{{ formatRupiah(ringkasan.pemasukan) }}</strong></span>
        <span>Keluar <strong class="keluar">{{ formatRupiah(ringkasan.pengeluaran) }}</strong></span>
        <span>Selisih <strong>{{ formatRupiah(ringkasan.saldo) }}</strong></span>
      </div>

      <p v-if="hasilFilter.length === 0" class="kosong">Tidak ada transaksi yang cocok.</p>
      <ul v-else class="daftar">
        <TransaksiItem
          v-for="t in hasilFilter"
          :key="t.id"
          :transaksi="t"
          bisa-diubah
          @edit="mulaiEdit(t)"
          @hapus="konfirmasiHapus(t)"
        />
      </ul>
    </section>
  </div>
</template>

<style scoped>
.tata-letak { display: grid; gap: 20px; }
@media (min-width: 820px) {
  .tata-letak { grid-template-columns: 340px 1fr; align-items: start; }
  .tata-letak > form { position: sticky; top: 84px; }
}
.jumlah { color: var(--teks-redup); }
.tombol-excel { background: #1d6f42; border-color: #1d6f42; color: #fff; padding: 8px 14px; font-size: 0.9rem; }
.tombol-excel:disabled { opacity: 0.5; cursor: not-allowed; }
.filter { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
@media (max-width: 520px) { .filter { grid-template-columns: 1fr 1fr; } .filter label:first-child { grid-column: 1 / -1; } }
.mini-ringkasan {
  display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 0.85rem; color: var(--teks-redup);
  padding: 10px 12px; background: var(--latar); border-radius: 10px;
}
.mini-ringkasan strong { color: var(--teks); }
.mini-ringkasan .masuk { color: var(--hijau); }
.mini-ringkasan .keluar { color: var(--merah); }
</style>
