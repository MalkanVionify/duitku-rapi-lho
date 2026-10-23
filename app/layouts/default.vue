<script setup lang="ts">
const { user, loginGoogle, logout, tersedia } = useAuth()
const { jumlahLokal, pindahkanKeAkun } = useTransaksi()
const { tema, gantiTema } = useTema()
const labelTema = computed(() => (tema.value === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'))

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
          <!-- Ikon hanya tampil di sidebar desktop -->
          <NuxtLink to="/">
            <svg class="ikon-nav" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
            Dashboard
          </NuxtLink>
          <NuxtLink to="/transaksi">
            <svg class="ikon-nav" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16M7 4 3.5 7.5M7 4l3.5 3.5M17 20V4m0 16-3.5-3.5M17 20l3.5-3.5" /></svg>
            Transaksi
          </NuxtLink>
          <NuxtLink to="/wrapped">
            <svg class="ikon-nav" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.2 5.3L20 9l-4.4 3.8L17 18.5 12 15.6 7 18.5l1.4-5.7L4 9l5.8-.7z" /></svg>
            <span><span class="awalan">Duitku </span>Wrapped</span>
          </NuxtLink>
          <NuxtLink to="/tentang">
            <svg class="ikon-nav" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.5" /></svg>
            Tentang
          </NuxtLink>
        </nav>
        <div class="kanan">
          <button class="tombol-tema" :aria-label="labelTema" :title="labelTema" @click="gantiTema">
            <!-- Matahari saat gelap (klik → terang), bulan saat terang (klik → gelap) -->
            <svg v-if="tema === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            <span class="label-tema">{{ tema === 'dark' ? 'Mode terang' : 'Mode gelap' }}</span>
          </button>
          <div v-if="tersedia" class="akun" :class="{ masuk: user }">
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
.header { background: var(--kartu); position: sticky; top: 0; z-index: 10; }
.header::after { content: ''; display: block; height: 3px; background: linear-gradient(90deg, var(--hiasan-b), var(--hiasan-a)); }
.header-isi { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 12px; padding-bottom: 12px; flex-wrap: wrap; }
.logo { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--teks); text-decoration: none; }
.logo-ikon { width: 34px; height: 34px; }
.nav { display: flex; gap: 4px; }
.nav a { padding: 6px 12px; border-radius: 8px; color: var(--teks-redup); text-decoration: none; font-weight: 600; font-size: 0.95rem; }
.nav a:hover { color: var(--sorot); }
.nav a.router-link-exact-active { background: var(--sorot-muda); color: var(--sorot); }
.kanan { display: flex; align-items: center; gap: 10px; }
.tombol-tema {
  width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--garis);
  background: var(--kartu); color: var(--sorot); display: grid; place-items: center; cursor: pointer;
}
.tombol-tema:hover { background: var(--sorot-muda); }
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
/* Di layar sempit: logo + tombol tema + akun di baris atas, menu di baris kedua */
@media (max-width: 640px) {
  .nav { order: 3; width: 100%; overflow-x: auto; scrollbar-width: none; }
  .nav a { white-space: nowrap; }
}
@media (max-width: 440px) {
  .nav a { padding: 6px 10px; }
  .awalan { display: none; }
}
@media (max-width: 520px) { .nama { display: none; } }

.ikon-nav, .label-tema { display: none; }

/* Desktop: header berubah jadi sidebar di kiri, konten melebar mengisi layar */
@media (min-width: 1024px) {
  .halaman { display: grid; grid-template-columns: 248px minmax(0, 1fr); grid-template-rows: 1fr auto; min-height: 100vh; }
  .header { grid-column: 1; grid-row: 1 / span 2; height: 100vh; border-right: 1px solid var(--garis); }
  .header::after { position: absolute; top: 0; right: -2px; width: 3px; height: 100%; background: linear-gradient(180deg, var(--hiasan-b), var(--hiasan-a)); }
  .header-isi {
    max-width: none; height: 100%; padding: 24px 16px;
    flex-direction: column; align-items: stretch; justify-content: flex-start; flex-wrap: nowrap; gap: 28px;
  }
  .logo { padding: 0 8px; font-size: 1.05rem; }
  .logo-ikon { width: 38px; height: 38px; }
  .nav { flex-direction: column; gap: 4px; }
  .nav a { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; }
  .ikon-nav { display: block; width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .kanan { margin-top: auto; flex-direction: column; align-items: stretch; gap: 10px; }
  .tombol-tema {
    width: 100%; height: auto; border-radius: 10px; padding: 9px 12px;
    display: flex; align-items: center; gap: 12px; font: inherit; font-weight: 600; font-size: 0.9rem;
  }
  .label-tema { display: inline; color: var(--teks-redup); }
  .akun { flex-wrap: wrap; }
  .akun.masuk { padding: 12px; border-radius: 12px; background: var(--latar); border: 1px solid var(--garis); }
  .akun .nama { flex: 1; max-width: none; }
  .akun .tombol { width: 100%; }
  .tombol-google { justify-content: center; white-space: nowrap; padding: 9px 12px; }
  .konten, .footer { grid-column: 2; width: 100%; max-width: 1680px; margin: 0; padding-left: 40px; padding-right: 40px; }
  .konten { padding-top: 32px; }
}
</style>
