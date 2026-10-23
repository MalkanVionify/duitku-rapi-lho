// Dijalankan sekali saat aplikasi dibuka di browser:
// cek status login, lalu muat data dari sumber yang sesuai.
export default defineNuxtPlugin(async () => {
  const supabase = useSupabase()
  const user = useUser()
  const { muatUlang } = useTransaksi()
  const { muatUlang: muatRencana } = useRencana()

  if (supabase) {
    // Kalau baru kembali dari halaman login Google, sesi dibuat dari ?code= di URL
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null

    const url = new URL(window.location.href)
    if (url.searchParams.has('code')) {
      url.searchParams.delete('code')
      window.history.replaceState(window.history.state, '', url)
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  // Muat ulang data setiap kali user login / logout
  watch(() => user.value?.id, () => Promise.all([muatUlang(), muatRencana()]), { immediate: true })
})
