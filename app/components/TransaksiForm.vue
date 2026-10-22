<script setup lang="ts">
import { KATEGORI, type DataTransaksi, type JenisTransaksi, type Transaksi } from '~/composables/useTransaksi'

const props = defineProps<{ edit?: Transaksi | null }>()
const emit = defineEmits<{ simpan: [data: DataTransaksi]; batal: [] }>()

function formKosong(): DataTransaksi {
  return { jenis: 'pengeluaran', nominal: 0, kategori: 'Makanan', tanggal: hariIni(), catatan: '' }
}

const form = reactive<DataTransaksi>(formKosong())
const pesanError = ref('')

// Saat tombol "Edit" diklik, isi form dengan data transaksi tersebut
watch(
  () => props.edit,
  (t) => {
    if (t) {
      const { id, ...data } = t
      Object.assign(form, data)
    } else {
      Object.assign(form, formKosong())
    }
  },
  { immediate: true },
)

// Kalau jenis berubah, pastikan kategori tetap valid
watch(
  () => form.jenis,
  (jenis: JenisTransaksi) => {
    if (!KATEGORI[jenis].includes(form.kategori)) form.kategori = KATEGORI[jenis][0]!
  },
)

function kirim() {
  if (!(form.nominal > 0)) {
    pesanError.value = 'Nominal harus lebih dari 0.'
    return
  }
  if (!form.tanggal) {
    pesanError.value = 'Tanggal wajib diisi.'
    return
  }
  pesanError.value = ''
  emit('simpan', { ...form, catatan: form.catatan.trim() })
  if (!props.edit) Object.assign(form, formKosong())
}
</script>

<template>
  <form class="kartu form" @submit.prevent="kirim">
    <h2>{{ edit ? 'Edit Transaksi' : 'Tambah Transaksi' }}</h2>

    <div class="pilihan-jenis">
      <button
        type="button"
        :class="['tombol-jenis', { aktif: form.jenis === 'pengeluaran', keluar: true }]"
        @click="form.jenis = 'pengeluaran'"
      >
        Pengeluaran
      </button>
      <button
        type="button"
        :class="['tombol-jenis', { aktif: form.jenis === 'pemasukan', masuk: true }]"
        @click="form.jenis = 'pemasukan'"
      >
        Pemasukan
      </button>
    </div>

    <label>
      Nominal (Rp)
      <input v-model.number="form.nominal" type="number" min="0" step="500" placeholder="50000" required>
    </label>

    <div class="baris">
      <label>
        Kategori
        <select v-model="form.kategori">
          <option v-for="k in KATEGORI[form.jenis]" :key="k" :value="k">{{ k }}</option>
        </select>
      </label>
      <label>
        Tanggal
        <input v-model="form.tanggal" type="date" required>
      </label>
    </div>

    <label>
      Catatan
      <input v-model="form.catatan" type="text" maxlength="100" placeholder="Contoh: makan siang">
    </label>

    <p v-if="pesanError" class="error">{{ pesanError }}</p>

    <div class="aksi">
      <button type="submit" class="tombol utama">{{ edit ? 'Simpan Perubahan' : 'Tambah' }}</button>
      <button v-if="edit" type="button" class="tombol" @click="emit('batal')">Batal</button>
    </div>
  </form>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 12px; }
.form h2 { margin: 0; font-size: 1.1rem; }
.pilihan-jenis { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tombol-jenis {
  padding: 10px; border-radius: 10px; border: 1px solid var(--garis);
  background: var(--latar); color: var(--teks-redup); font-weight: 600; cursor: pointer;
}
.tombol-jenis.aktif.keluar { background: var(--merah-muda); color: var(--merah); border-color: var(--merah); }
.tombol-jenis.aktif.masuk { background: var(--hijau-muda); color: var(--hijau); border-color: var(--hijau); }
.baris { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.aksi { display: flex; gap: 8px; }
.error { color: var(--merah); margin: 0; font-size: 0.9rem; }
</style>
