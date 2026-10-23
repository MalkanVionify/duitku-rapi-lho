export type JenisTarget = 'tabungan' | 'batas'

export interface Target {
  id: string
  jenis: JenisTarget
  kategori: string // kosong untuk target tabungan
  nominal: number
}

export interface DanaRutin {
  id: string
  nama: string
  kategori: string
  nominal: number
  tanggal: number // tanggal jatuh tempo tiap bulan (1-31)
}

export type DataDanaRutin = Omit<DanaRutin, 'id'>

const KUNCI_STORAGE = 'duitku-rapi-lho:rencana'

function muatLokal(): { target: Target[]; rutin: DanaRutin[] } {
  try {
    const isi = JSON.parse(localStorage.getItem(KUNCI_STORAGE) ?? '{}')
    return { target: isi.target ?? [], rutin: isi.rutin ?? [] }
  } catch {
    return { target: [], rutin: [] }
  }
}

// Tabel belum dibuat di Supabase (rencana.sql belum dijalankan)
function tabelBelumAda(error: { code?: string; message?: string }) {
  return error.code === 'PGRST205' || error.code === '42P01' || /does not exist|could not find the table/i.test(error.message ?? '')
}

// Target bulanan & dana rutin. Sumber data sama seperti transaksi:
// belum login → localStorage, sudah login → tabel Supabase.
export function useRencana() {
  const target = useState<Target[]>('rencana-target', () => [])
  const rutin = useState<DanaRutin[]>('rencana-rutin', () => [])
  // true kalau sudah login tapi tabel Supabase belum disiapkan
  const belumSiap = useState('rencana-belum-siap', () => false)

  const supabase = useSupabase()
  const user = useUser()
  const online = () => !!(supabase && user.value)

  function simpanLokal() {
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify({ target: target.value, rutin: rutin.value }))
  }

  async function muatUlang() {
    belumSiap.value = false
    if (!online()) {
      const lokal = muatLokal()
      target.value = lokal.target
      rutin.value = lokal.rutin
      return
    }
    const [t, r] = await Promise.all([
      supabase!.from('target_bulanan').select('id, jenis, kategori, nominal'),
      supabase!.from('dana_rutin').select('id, nama, kategori, nominal, tanggal'),
    ])
    const error = t.error ?? r.error
    if (error) {
      if (tabelBelumAda(error)) belumSiap.value = true
      else console.error(error)
      target.value = []
      rutin.value = []
      return
    }
    target.value = t.data
    rutin.value = r.data
  }

  // Simpan target (tambah atau ubah). Nominal 0 berarti target dihapus.
  async function aturTarget(jenis: JenisTarget, kategori: string, nominal: number) {
    const ada = target.value.find((t) => t.jenis === jenis && t.kategori === kategori)
    if (!nominal) {
      if (ada) await hapusTarget(ada.id)
      return
    }
    if (ada) {
      if (online()) {
        const { error } = await supabase!.from('target_bulanan').update({ nominal }).eq('id', ada.id)
        if (error) throw error
      }
      ada.nominal = nominal
    } else {
      const baru: Target = { id: crypto.randomUUID(), jenis, kategori, nominal }
      if (online()) {
        const { error } = await supabase!.from('target_bulanan').insert(baru)
        if (error) throw error
      }
      target.value.push(baru)
    }
    if (!online()) simpanLokal()
  }

  async function hapusTarget(id: string) {
    if (online()) {
      const { error } = await supabase!.from('target_bulanan').delete().eq('id', id)
      if (error) throw error
    }
    target.value = target.value.filter((t) => t.id !== id)
    if (!online()) simpanLokal()
  }

  async function tambahRutin(data: DataDanaRutin) {
    const baru: DanaRutin = { ...data, id: crypto.randomUUID() }
    if (online()) {
      const { error } = await supabase!.from('dana_rutin').insert(baru)
      if (error) throw error
    }
    rutin.value.push(baru)
    if (!online()) simpanLokal()
  }

  async function ubahRutin(id: string, data: DataDanaRutin) {
    if (online()) {
      const { error } = await supabase!.from('dana_rutin').update(data).eq('id', id)
      if (error) throw error
    }
    const index = rutin.value.findIndex((r) => r.id === id)
    if (index !== -1) rutin.value[index] = { ...data, id }
    if (!online()) simpanLokal()
  }

  async function hapusRutin(id: string) {
    if (online()) {
      const { error } = await supabase!.from('dana_rutin').delete().eq('id', id)
      if (error) throw error
    }
    rutin.value = rutin.value.filter((r) => r.id !== id)
    if (!online()) simpanLokal()
  }

  return { target, rutin, belumSiap, muatUlang, aturTarget, hapusTarget, tambahRutin, ubahRutin, hapusRutin }
}
