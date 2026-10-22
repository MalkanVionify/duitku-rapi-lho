export type Tema = 'light' | 'dark'

const KUNCI_TEMA = 'duitku-rapi-lho:tema'
// Warna bilah browser di HP (meta theme-color) untuk tiap tema
const WARNA_BILAH: Record<Tema, string> = { light: '#2563eb', dark: '#090c0e' }

// Tema awal sudah dipasang script di <head> (lihat nuxt.config.ts) supaya halaman tidak berkedip.
// Composable ini cuma membaca nilai itu dan menyimpan pilihan user.
export function useTema() {
  const tema = useState<Tema>('tema', () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))

  useHead({ meta: [{ name: 'theme-color', content: () => WARNA_BILAH[tema.value] }] })

  function gantiTema() {
    tema.value = tema.value === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = tema.value
    try {
      localStorage.setItem(KUNCI_TEMA, tema.value)
    } catch {
      // Mode privat / storage diblokir: tema tetap berganti, hanya tidak diingat
    }
  }

  return { tema, gantiTema }
}
