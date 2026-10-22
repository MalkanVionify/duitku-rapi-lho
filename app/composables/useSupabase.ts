import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

// Satu koneksi Supabase untuk seluruh aplikasi.
// Mengembalikan null kalau URL/key belum diatur (mode lokal saja).
export function useSupabase() {
  if (client === undefined) {
    const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
    client = supabaseUrl && supabaseKey
      ? createClient(supabaseUrl, supabaseKey, { auth: { flowType: 'pkce' } })
      : null
  }
  return client
}

// User yang sedang login (null kalau belum login)
export function useUser() {
  return useState<User | null>('user', () => null)
}

export function useAuth() {
  const supabase = useSupabase()
  const user = useUser()

  async function loginGoogle() {
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // Setelah login di Google, kembali ke halaman yang sedang dibuka
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
    if (error) alert(`Gagal login: ${error.message}`)
  }

  async function logout() {
    await supabase?.auth.signOut()
  }

  return { user, loginGoogle, logout, tersedia: !!supabase }
}
