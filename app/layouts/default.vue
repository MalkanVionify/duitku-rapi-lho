<script setup lang="ts">
const { user, loginGoogle, logout, tersedia } = useAuth()
const { jumlahLokal, pindahkanKeAkun } = useTransaksi()

const namaUser = computed(() => user.value?.user_metadata.full_name ?? user.value?.email ?? '')
const fotoUser = computed(() => user.value?.user_metadata.avatar_url as string | undefined)

const sedangPindah = ref(false)
const bannerDitutup = ref(false)

async function pindahkan() {
  sedangPindah.value = true
  try {
    await pindahkanKeAkun()
  } catch (e) {
    console.error(e)
    alert('Gagal memindahkan data. Coba lagi ya.')
  } finally {
    sedangPindah.value = false
  }
}
</script>

<template>
  <div class="halaman">
    <header class="header">
      <div class="wadah header-isi">
        <NuxtLink to="/" class="logo">
          <img src="/logo.svg" alt="" class="logo-ikon">
          Duitku Rapi Lho
        </NuxtLink>
        <nav class="nav">
          <NuxtLink to="/">Dashboard</NuxtLink>
          <NuxtLink to="/transaksi">Transaksi</NuxtLink>
          <NuxtLink to="/tentang">Tentang</NuxtLink>
        </nav>
        <div v-if="tersedia" class="akun">
          <template v-if="user">
            <img v-if="fotoUser" :src="fotoUser" :alt="namaUser" class="foto" referrerpolicy="no-referrer">
            <span class="nama">{{ namaUser }}</span>
            <button class="tombol kecil" @click="logout">Keluar</button>
          </template>
          <button v-else class="tombol kecil tombol-google" @click="loginGoogle">
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z" />
              <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-5 2.3-8.2 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
            </svg>
            Masuk dengan Google
          </button>
        </div>
      </div>
    </header>

    <main class="wadah konten">
      <div v-if="user && jumlahLokal > 0 && !bannerDitutup" class="banner">
        <span>
          Ada <strong>{{ jumlahLokal }} transaksi</strong> yang tersimpan di perangkat ini.
          Pindahkan ke akunmu supaya bisa dibuka di mana saja?
        </span>
        <div class="banner-aksi">
          <button class="tombol kecil utama" :disabled="sedangPindah" @click="pindahkan">
            {{ sedangPindah ? 'Memindahkan…' : 'Pindahkan' }}
          </button>
          <button class="tombol kecil" @click="bannerDitutup = true">Nanti</button>
        </div>
      </div>

      <slot />
    </main>

    <footer class="wadah footer">
      Duitku Rapi Lho © {{ new Date().getFullYear() }} · Dibuat dengan Nuxt
      <span v-if="tersedia"> · {{ user ? 'Data tersimpan di akunmu' : 'Data tersimpan di browser ini' }}</span>
      <br>
      <NuxtLink to="/privasi">Kebijakan Privasi</NuxtLink> · <NuxtLink to="/ketentuan">Ketentuan Layanan</NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
.header { background: var(--kartu); border-bottom: 1px solid var(--garis); position: sticky; top: 0; z-index: 10; }
.header-isi { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 12px; padding-bottom: 12px; flex-wrap: wrap; }
.logo { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--teks); text-decoration: none; }
.logo-ikon { width: 34px; height: 34px; }
.nav { display: flex; gap: 4px; }
.nav a { padding: 6px 12px; border-radius: 8px; color: var(--teks-redup); text-decoration: none; font-weight: 600; font-size: 0.95rem; }
.nav a.router-link-exact-active { background: var(--utama-muda); color: var(--utama); }
.akun { display: flex; align-items: center; gap: 8px; }
.foto { width: 30px; height: 30px; border-radius: 50%; }
.nama { font-size: 0.9rem; font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tombol.kecil { padding: 6px 12px; font-size: 0.85rem; }
.tombol-google { display: flex; align-items: center; gap: 8px; }
.banner {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
  background: var(--utama-muda); border: 1px solid var(--utama); border-radius: 14px; padding: 12px 16px; font-size: 0.95rem;
}
.banner-aksi { display: flex; gap: 8px; }
.konten { padding-top: 24px; padding-bottom: 24px; display: flex; flex-direction: column; gap: 20px; }
.footer { color: var(--teks-redup); font-size: 0.85rem; text-align: center; padding-bottom: 24px; }
.footer a { color: inherit; }
@media (max-width: 520px) { .nama { display: none; } }
</style>
