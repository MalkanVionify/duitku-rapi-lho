<script setup lang="ts">
defineProps<{ pemasukan: number; pengeluaran: number; saldo: number }>()
</script>

<template>
  <div class="ringkasan">
    <div class="kartu saldo">
      <small>Saldo</small>
      <strong>{{ formatRupiah(saldo) }}</strong>
    </div>
    <div class="kartu">
      <small>Pemasukan</small>
      <strong class="masuk">{{ formatRupiah(pemasukan) }}</strong>
    </div>
    <div class="kartu">
      <small>Pengeluaran</small>
      <strong class="keluar">{{ formatRupiah(pengeluaran) }}</strong>
    </div>
  </div>
</template>

<style scoped>
.ringkasan { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ringkasan .kartu { display: flex; flex-direction: column; gap: 4px; }
.ringkasan small { color: var(--teks-redup); }
.ringkasan strong { font-size: 1.15rem; }
.saldo { grid-column: 1 / -1; background: var(--utama); color: #fff; border: none; }
.saldo small { color: rgba(255, 255, 255, 0.8); }
.saldo strong { font-size: 1.8rem; }
.masuk { color: var(--hijau); }
.keluar { color: var(--merah); }
@media (min-width: 720px) {
  .ringkasan { grid-template-columns: 2fr 1fr 1fr; }
  .saldo { grid-column: auto; }
}
</style>
