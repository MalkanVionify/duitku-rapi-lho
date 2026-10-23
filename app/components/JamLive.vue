<script setup lang="ts">
// Jam yang berjalan setiap detik
const sekarang = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => (sekarang.value = new Date()), 1000)
})
onUnmounted(() => clearInterval(timer))

const tanggal = computed(() =>
  sekarang.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
)
const jam = computed(() =>
  sekarang.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
)
const zona = computed(() =>
  sekarang.value.toLocaleTimeString('id-ID', { timeZoneName: 'short' }).split(' ').pop(),
)
</script>

<template>
  <div class="jam-live" role="timer" aria-live="off">
    <span class="titik" aria-hidden="true" />
    <span class="tanggal">{{ tanggal }}</span>
    <strong class="jam">{{ jam }}</strong>
    <small class="zona">{{ zona }}</small>
  </div>
</template>

<style scoped>
.jam-live {
  display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; padding: 6px 14px; border-radius: 99px;
  background: var(--kartu); border: 1px solid var(--garis); font-size: 0.85rem; color: var(--teks-redup);
}
.titik { width: 8px; height: 8px; border-radius: 50%; background: var(--hiasan-a); animation: denyut 1s ease-in-out infinite; }
.jam { color: var(--teks); font-variant-numeric: tabular-nums; font-size: 0.95rem; }
.zona { font-weight: 700; color: var(--sorot); }
@keyframes denyut { 50% { opacity: 0.3; } }
@media (prefers-reduced-motion: reduce) { .titik { animation: none; } }
</style>
