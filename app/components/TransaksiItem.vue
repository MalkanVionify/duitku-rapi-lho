<script setup lang="ts">
import type { Transaksi } from '~/composables/useTransaksi'

defineProps<{ transaksi: Transaksi; bisaDiubah?: boolean }>()
const emit = defineEmits<{ edit: []; hapus: [] }>()
</script>

<template>
  <li class="item">
    <div class="ikon" :class="transaksi.jenis">
      {{ transaksi.jenis === 'pemasukan' ? '↓' : '↑' }}
    </div>
    <div class="info">
      <strong>{{ transaksi.catatan || transaksi.kategori }}</strong>
      <small>{{ transaksi.kategori }} · {{ formatTanggal(transaksi.tanggal) }}</small>
    </div>
    <div class="kanan">
      <span class="nominal" :class="transaksi.jenis">
        {{ transaksi.jenis === 'pemasukan' ? '+' : '−' }}{{ formatRupiah(transaksi.nominal) }}
      </span>
      <div v-if="bisaDiubah" class="aksi">
        <button class="link" @click="emit('edit')">Edit</button>
        <button class="link hapus" @click="emit('hapus')">Hapus</button>
      </div>
    </div>
  </li>
</template>

<style scoped>
.item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--garis); }
.item:last-child { border-bottom: none; }
.ikon {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  display: grid; place-items: center; font-weight: 700;
}
.ikon.pemasukan { background: var(--hijau-muda); color: var(--hijau); }
.ikon.pengeluaran { background: var(--merah-muda); color: var(--merah); }
.info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.info strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.info small { color: var(--teks-redup); }
.kanan { text-align: right; }
.nominal { font-weight: 700; white-space: nowrap; }
.nominal.pemasukan { color: var(--hijau); }
.nominal.pengeluaran { color: var(--merah); }
.aksi { display: flex; gap: 10px; justify-content: flex-end; margin-top: 2px; }
.link { background: none; border: none; padding: 0; color: var(--utama); cursor: pointer; font-size: 0.85rem; }
.link.hapus { color: var(--merah); }
</style>
