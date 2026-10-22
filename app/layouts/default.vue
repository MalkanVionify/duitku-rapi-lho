<template>
  <div class="halaman">
    <header class="header">
      <div class="wadah header-isi">
        <NuxtLink to="/" class="logo">
          <span class="logo-ikon">Rp</span>
          Duitku Rapi Lho
        </NuxtLink>
        <nav class="nav">
          <NuxtLink to="/">Dashboard</NuxtLink>
          <NuxtLink to="/transaksi">Transaksi</NuxtLink>
          <NuxtLink to="/tentang">Tentang</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="wadah konten">
      <slot />
    </main>

    <footer class="wadah footer">
      Duitku Rapi Lho © {{ new Date().getFullYear() }} · Dibuat dengan Nuxt
    </footer>
  </div>
</template>

<style scoped>
.header { background: var(--kartu); border-bottom: 1px solid var(--garis); position: sticky; top: 0; z-index: 10; }
.header-isi { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 12px; padding-bottom: 12px; flex-wrap: wrap; }
.logo { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--teks); text-decoration: none; }
.logo-ikon {
  width: 32px; height: 32px; border-radius: 8px; background: var(--utama); color: #fff;
  display: grid; place-items: center; font-size: 0.8rem;
}
.nav { display: flex; gap: 4px; }
.nav a { padding: 6px 12px; border-radius: 8px; color: var(--teks-redup); text-decoration: none; font-weight: 600; font-size: 0.95rem; }
.nav a.router-link-exact-active { background: var(--utama-muda); color: var(--utama); }
.konten { padding-top: 24px; padding-bottom: 24px; display: flex; flex-direction: column; gap: 20px; }
.footer { color: var(--teks-redup); font-size: 0.85rem; text-align: center; padding-bottom: 24px; }
</style>
