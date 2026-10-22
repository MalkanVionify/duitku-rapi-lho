<script setup lang="ts">
useHead({ title: 'Kebijakan Privasi · Duitku Rapi Lho' })
</script>

<template>
  <section class="kartu dokumen">
    <h1>Kebijakan Privasi</h1>
    <p class="redup">Berlaku sejak 22 Oktober 2026</p>

    <p>
      Halaman ini menjelaskan data apa saja yang dikumpulkan <strong>Duitku Rapi Lho</strong>
      dan bagaimana data itu digunakan.
    </p>

    <h2>Data yang kami simpan</h2>
    <ul>
      <li>
        <strong>Tanpa login:</strong> transaksi hanya disimpan di browser perangkatmu (localStorage)
        dan tidak dikirim ke server mana pun.
      </li>
      <li>
        <strong>Dengan login Google:</strong> kami menerima nama, alamat email, dan foto profil
        dari akun Google-mu. Transaksi (jenis, nominal, kategori, tanggal, dan catatan) disimpan
        di database Supabase dan terhubung ke akunmu.
      </li>
    </ul>

    <h2>Cara data digunakan</h2>
    <ul>
      <li>Nama dan foto hanya ditampilkan di header aplikasi.</li>
      <li>Email dipakai untuk mengenali akunmu saat login.</li>
      <li>Transaksi dipakai untuk menampilkan ringkasan, grafik, dan ekspor Excel milikmu sendiri.</li>
    </ul>
    <p>
      Setiap pengguna hanya bisa mengakses transaksinya sendiri. Kami tidak menjual, membagikan,
      atau memakai datamu untuk iklan.
    </p>

    <h2>Layanan pihak ketiga</h2>
    <ul>
      <li><strong>Google</strong> untuk login</li>
      <li><strong>Supabase</strong> untuk menyimpan akun dan transaksi</li>
      <li><strong>Vercel</strong> untuk menjalankan situs ini</li>
    </ul>

    <h2>Menghapus data</h2>
    <p>
      Kamu bisa menghapus transaksi kapan saja dari halaman Transaksi. Untuk menghapus akun
      beserta seluruh datanya, hubungi pembuat aplikasi lewat
      <a href="https://github.com/MalkanVionify" target="_blank" rel="noopener">GitHub MalkanVionify</a>.
    </p>
  </section>
</template>

<style scoped>
.dokumen h1 { margin: 0; font-size: 1.4rem; }
.dokumen h2 { font-size: 1.05rem; margin-bottom: 4px; }
.dokumen ul { margin-top: 0; padding-left: 20px; }
.redup { color: var(--teks-redup); font-size: 0.9rem; margin-top: 4px; }
</style>
