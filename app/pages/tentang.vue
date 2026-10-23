<script setup lang="ts">
useHead({ title: 'Tentang · Duitku Rapi Lho' })
</script>

<template>
  <section class="kartu tentang">
    <h1>Tentang Duitku Rapi Lho</h1>
    <p>
      <strong>Duitku Rapi Lho</strong> adalah aplikasi pencatatan keuangan pribadi yang simpel.
      Catat pemasukan dan pengeluaran, lihat saldo, dan pantau ke mana uangmu pergi setiap bulan.
    </p>

    <h2>Fitur</h2>
    <ul>
      <li>Tambah, edit, dan hapus transaksi</li>
      <li>Ringkasan saldo, pemasukan, dan pengeluaran bulan ini</li>
      <li>Grafik pengeluaran per kategori</li>
      <li>Filter transaksi per bulan, jenis, dan kategori</li>
      <li>Ketik Cepat: tulis "bakso 15rb kemarin", langsung tercatat</li>
      <li>Heatmap kalender pemasukan &amp; pengeluaran</li>
      <li>Duitku Wrapped: rekap bulanan &amp; tahunan ala stories</li>
      <li>Data tersimpan di browser (localStorage), tanpa perlu login</li>
    </ul>

    <h2>Teknologi</h2>
    <ul>
      <li>Nuxt + Vue 3 (Composition API)</li>
      <li>Deploy di Vercel</li>
    </ul>

    <h2>Pembuat</h2>
    <p>Dibuat oleh <strong>MalkanVionify</strong> sebagai challenge belajar Nuxt.</p>
  </section>
</template>

<style scoped>
.tentang h1 { margin-top: 0; font-size: 1.4rem; }
.tentang h2 { font-size: 1.05rem; margin-bottom: 4px; }
.tentang ul { margin-top: 0; padding-left: 20px; }
</style>
