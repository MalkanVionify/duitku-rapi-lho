<p align="center"><img src="public/logo-lengkap.svg" alt="Duitku Rapi Lho" width="360"></p>

# Duitku Rapi Lho

Keuangan keluarga, rapi bersama. Aplikasi pencatatan keuangan dengan Nuxt, Supabase, dan Vercel.

🔗 **Demo:** https://duitku-rapi-lho.vercel.app

## Fitur

- Tambah, edit, dan hapus transaksi (pemasukan/pengeluaran)
- Ringkasan saldo, pemasukan, dan pengeluaran bulan ini
- Grafik batang pengeluaran per kategori
- Filter transaksi per bulan, jenis, dan kategori
- Data tersimpan di browser (localStorage)
- Mendukung dark mode otomatis

## Menjalankan di komputer

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Struktur folder

```
app/
├─ app.vue                  # root aplikasi
├─ layouts/default.vue      # header, navigasi, footer
├─ pages/                   # setiap file = 1 halaman (routing otomatis)
│  ├─ index.vue             # /           → dashboard
│  ├─ transaksi.vue         # /transaksi  → form + daftar + filter
│  └─ tentang.vue           # /tentang
├─ components/              # komponen yang dipakai ulang
├─ composables/useTransaksi.ts  # logika data (tambah/ubah/hapus + localStorage)
├─ utils/format.ts          # format Rupiah & tanggal
└─ assets/css/main.css      # gaya global & warna
```

## Deploy ke Vercel

1. Push project ini ke repository GitHub.
2. Login ke https://vercel.com memakai akun kamu sendiri.
3. Pilih **Add New → Project**, lalu import repository ini.
4. Vercel otomatis mengenali Nuxt, jadi tinggal klik **Deploy**.
5. Salin alamat `*.vercel.app` dan tempel di bagian **Demo** di atas.
