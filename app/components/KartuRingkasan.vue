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
.ringkasan { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.ringkasan .kartu { display: flex; flex-direction: column; gap: 4px; }
.ringkasan small { color: var(--teks-redup); }
.ringkasan strong { font-size: clamp(1rem, 4.8vw, 1.15rem); overflow-wrap: anywhere; }
.saldo {
  grid-column: 1 / -1; color: #fff; border: none; position: relative; overflow: hidden;
  background: linear-gradient(120deg, var(--saldo-dari), var(--saldo-ke));
}
/* Hiasan lingkaran putih transparan di pojok kartu */
.saldo::before, .saldo::after { content: ''; position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.18); }
.saldo::after { right: -36px; top: -36px; width: 120px; height: 120px; }
.saldo::before { right: 92px; bottom: -22px; width: 48px; height: 48px; background: rgba(255, 255, 255, 0.12); }
.saldo > * { position: relative; z-index: 1; }
.saldo small { color: inherit; opacity: 0.85; }
.saldo strong { font-size: clamp(1.45rem, 7.5vw, 1.8rem); }
.masuk { color: var(--hijau); }
.keluar { color: var(--merah); }
@media (min-width: 720px) {
  .ringkasan { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr); }
  .saldo { grid-column: auto; }
}
</style>
