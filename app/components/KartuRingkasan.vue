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
.saldo {
  grid-column: 1 / -1; color: var(--utama-teks); border: none; position: relative; overflow: hidden;
  background: linear-gradient(135deg, var(--utama), var(--utama-tua));
}
/* Hiasan lingkaran pink di pojok kartu (solid, supaya tidak bercampur jadi cokelat dengan hijau) */
.saldo::before, .saldo::after { content: ''; position: absolute; border-radius: 50%; background: var(--aksen); }
.saldo::after { right: -36px; top: -36px; width: 120px; height: 120px; }
.saldo::before { right: 92px; bottom: -22px; width: 48px; height: 48px; background: #fde4ec; }
.saldo > * { position: relative; z-index: 1; }
.saldo small { color: inherit; opacity: 0.85; }
.saldo strong { font-size: 1.8rem; }
.masuk { color: var(--hijau); }
.keluar { color: var(--merah); }
@media (min-width: 720px) {
  .ringkasan { grid-template-columns: 2fr 1fr 1fr; }
  .saldo { grid-column: auto; }
}
</style>
