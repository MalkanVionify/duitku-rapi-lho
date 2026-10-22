// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Data disimpan di localStorage (hanya ada di browser),
  // jadi aplikasi dijalankan sebagai SPA tanpa server-side rendering.
  ssr: false,

  css: ['~/assets/css/main.css'],

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
