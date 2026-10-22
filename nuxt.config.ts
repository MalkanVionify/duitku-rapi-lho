// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Data disimpan di localStorage / Supabase langsung dari browser,
  // jadi aplikasi dijalankan sebagai SPA tanpa server-side rendering.
  ssr: false,

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Diisi dari env NUXT_PUBLIC_SUPABASE_URL dan NUXT_PUBLIC_SUPABASE_KEY.
      // Kalau kosong, aplikasi tetap jalan dalam mode lokal (tanpa login).
      supabaseUrl: '',
      supabaseKey: '',
    },
  },

  app: {
    head: {
      title: 'Duitku Rapi Lho',
      htmlAttrs: { lang: 'id' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Aplikasi pencatatan keuangan pribadi yang simpel dan rapi.' },
      ],
      link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    },
  },
})
