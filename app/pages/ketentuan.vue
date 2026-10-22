<script setup lang="ts">
useHead({ title: 'Ketentuan Layanan · Duitku Rapi Lho' })
</script>

<template>
  <section class="kartu dokumen">
    <h1>Ketentuan Layanan</h1>
    <p class="redup">Berlaku sejak 22 Oktober 2026</p>

    <p>
      Dengan memakai <strong>Duitku Rapi Lho</strong>, kamu menyetujui ketentuan berikut.
    </p>

    <h2>Tentang layanan</h2>
    <p>
      Duitku Rapi Lho adalah aplikasi pencatatan keuangan gratis yang dibuat sebagai proyek
      belajar. Aplikasi ini hanya alat bantu mencatat, bukan layanan perbankan, pembayaran,
      atau nasihat keuangan.
    </p>

    <h2>Tanggung jawab pengguna</h2>
    <ul>
      <li>Kamu bertanggung jawab atas kebenaran data yang kamu catat.</li>
      <li>Jangan memakai aplikasi ini untuk hal yang melanggar hukum.</li>
      <li>Jaga keamanan akun Google yang kamu pakai untuk login.</li>
    </ul>

    <h2>Ketersediaan</h2>
    <p>
      Layanan disediakan apa adanya. Kami berusaha menjaga aplikasi tetap berjalan dan datamu
      tetap aman, tetapi tidak menjamin layanan selalu tersedia atau bebas dari kesalahan.
      Sebaiknya ekspor datamu ke Excel secara berkala sebagai cadangan.
    </p>

    <h2>Perubahan</h2>
    <p>
      Ketentuan ini bisa diperbarui sewaktu-waktu. Perubahan akan ditampilkan di halaman ini.
      Lihat juga <NuxtLink to="/privasi">Kebijakan Privasi</NuxtLink>.
    </p>
  </section>
</template>

<style scoped>
.dokumen h1 { margin: 0; font-size: 1.4rem; }
.dokumen h2 { font-size: 1.05rem; margin-bottom: 4px; }
.dokumen ul { margin-top: 0; padding-left: 20px; }
.redup { color: var(--teks-redup); font-size: 0.9rem; margin-top: 4px; }
</style>
