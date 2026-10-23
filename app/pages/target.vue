<script setup lang="ts">
import { KATEGORI, useTransaksi } from '~/composables/useTransaksi'
import { useRencana, type DanaRutin, type DataDanaRutin } from '~/composables/useRencana'
import sqlRencana from '~~/supabase/rencana.sql?raw'

useHead({ title: 'Target · Duitku Rapi Lho' })

const { terurut, tambah } = useTransaksi()
const { target, rutin, belumSiap, aturTarget, hapusTarget, tambahRutin, ubahRutin, hapusRutin } = useRencana()

const bulan = bulanIni()
const progres = computed(() => progresTarget(target.value, rutin.value, terurut.value))
const daftarRutin = computed(() => statusRutin(rutin.value, terurut.value))
const ramalan = computed(() => proyeksi(target.value, rutin.value, terurut.value))

async function coba(aksi: () => Promise<unknown>, pesanGagal = 'Gagal menyimpan. Coba lagi ya.') {
  try {
    await aksi()
  } catch (e) {
    console.error(e)
    alert(pesanGagal)
  }
}

// --- Target tabungan ---
const inputTabungan = ref<number | null>(null)
watch(() => progres.value.tabungan?.nominal, (n) => (inputTabungan.value = n ?? null), { immediate: true })
const simpanTabungan = () => coba(() => aturTarget('tabungan', '', Number(inputTabungan.value) || 0))

// --- Batas pengeluaran per kategori ---
const kategoriTersedia = computed(() =>
  KATEGORI.pengeluaran.filter((k) => !target.value.some((t) => t.jenis === 'batas' && t.kategori === k)),
)
const batasBaru = reactive({ kategori: '', nominal: null as number | null })
watch(kategoriTersedia, (list) => {
  if (!list.includes(batasBaru.kategori)) batasBaru.kategori = list[0] ?? ''
}, { immediate: true })

async function tambahBatas() {
  if (!batasBaru.kategori || !(Number(batasBaru.nominal) > 0)) return
  await coba(() => aturTarget('batas', batasBaru.kategori, Number(batasBaru.nominal)))
  batasBaru.nominal = null
}
function ubahBatas(kategori: string, sekarang: number) {
  const isi = prompt(`Batas pengeluaran ${kategori} per bulan (Rp):`, String(sekarang))
  if (isi === null) return
  coba(() => aturTarget('batas', kategori, Number(isi.replace(/\D/g, '')) || 0))
}

// --- Dana rutin ---
function formRutinKosong(): DataDanaRutin {
  return { nama: '', kategori: 'Tagihan', nominal: 0, tanggal: 1 }
}
const formRutin = reactive<DataDanaRutin>(formRutinKosong())
const editRutin = ref<string | null>(null)

function mulaiEditRutin(r: DanaRutin) {
  editRutin.value = r.id
  Object.assign(formRutin, { nama: r.nama, kategori: r.kategori, nominal: r.nominal, tanggal: r.tanggal })
}
function batalRutin() {
  editRutin.value = null
  Object.assign(formRutin, formRutinKosong())
}
async function simpanRutin() {
  const data = { ...formRutin, nama: formRutin.nama.trim(), nominal: Number(formRutin.nominal), tanggal: Number(formRutin.tanggal) }
  if (!data.nama || !(data.nominal > 0) || !(data.tanggal >= 1 && data.tanggal <= 31)) {
    alert('Isi nama, nominal, dan tanggal (1–31) dulu ya.')
    return
  }
  await coba(() => (editRutin.value ? ubahRutin(editRutin.value, data) : tambahRutin(data)))
  batalRutin()
}
function konfirmasiHapusRutin(r: DanaRutin) {
  if (confirm(`Hapus dana rutin "${r.nama}"?`)) coba(() => hapusRutin(r.id))
}
// Tandai lunas = catat sebagai pengeluaran hari ini dengan catatan = nama dana rutin
function tandaiDibayar(r: DanaRutin) {
  coba(() => tambah({ jenis: 'pengeluaran', nominal: r.nominal, kategori: r.kategori, tanggal: hariIni(), catatan: r.nama }))
}

// --- Salin SQL untuk menyiapkan tabel ---
const sqlDisalin = ref(false)
async function salinSql() {
  await navigator.clipboard.writeText(sqlRencana)
  sqlDisalin.value = true
}
</script>

<template>
  <section>
    <h1 class="judul">Target &amp; Rencana</h1>
    <p class="sub">Atur target bulanan, dana rutin, dan lihat perkiraan keuanganmu ke depan.</p>
  </section>

  <!-- Tabel Supabase belum dibuat -->
  <section v-if="belumSiap" class="kartu siapkan">
    <h2>Satu langkah lagi 🛠️</h2>
    <p>Menu Target butuh 2 tabel kecil di database. Cukup dilakukan sekali:</p>
    <ol>
      <li><button class="tombol utama kecil" @click="salinSql">{{ sqlDisalin ? 'SQL tersalin ✓' : 'Salin SQL' }}</button></li>
      <li>Buka <a href="https://supabase.com/dashboard/project/qotbbylyilxsvbapjzyu/sql/new" target="_blank" rel="noopener">Supabase → SQL Editor</a>, tekan <strong>Ctrl+V</strong>, lalu klik <strong>Run</strong></li>
      <li>Muat ulang halaman ini</li>
    </ol>
  </section>

  <div v-else class="grid">
    <div class="kolom">
      <!-- Target bulanan -->
      <section class="kartu">
        <div class="judul-bagian"><h2>🎯 Target Bulanan</h2><small>{{ formatBulan(bulan) }}</small></div>

        <h3>Target tabungan</h3>
        <form class="baris-input" @submit.prevent="simpanTabungan">
          <input v-model.number="inputTabungan" type="number" min="0" step="50000" placeholder="Contoh: 2000000" aria-label="Target tabungan per bulan">
          <button class="tombol utama" type="submit">Simpan</button>
        </form>
        <div v-if="progres.tabungan" class="progres">
          <div class="progres-label">
            <span>Perkiraan tersisihkan {{ formatRupiah(Math.max(0, progres.tabungan.terkumpul)) }}</span>
            <strong>{{ progres.tabungan.persen }}%</strong>
          </div>
          <div class="batang-latar"><div class="batang-isi tabungan" :style="{ width: `${Math.min(100, progres.tabungan.persen)}%` }" /></div>
        </div>

        <h3>Batas pengeluaran per kategori</h3>
        <p v-if="progres.batas.length === 0" class="kosong-kecil">Belum ada batas. Contoh: Makanan maksimal Rp1.500.000 per bulan.</p>
        <ul v-else class="daftar-batas">
          <li v-for="b in progres.batas" :key="b.id">
            <div class="progres-label">
              <span>{{ EMOJI_KATEGORI[b.kategori] }} {{ b.kategori }}</span>
              <span><strong :class="b.tingkat">{{ formatRupiah(b.terpakai) }}</strong> / {{ formatRupiah(b.nominal) }}</span>
            </div>
            <div class="batang-latar"><div class="batang-isi" :class="b.tingkat" :style="{ width: `${Math.min(100, b.persen)}%` }" /></div>
            <div class="aksi-kecil">
              <small :class="b.tingkat">{{ b.tingkat === 'lewat' ? `Lewat ${formatRupiah(b.terpakai - b.nominal)}` : `Sisa ${formatRupiah(b.nominal - b.terpakai)}` }}</small>
              <span>
                <button class="link" @click="ubahBatas(b.kategori, b.nominal)">Ubah</button>
                <button class="link hapus" @click="coba(() => hapusTarget(b.id))">Hapus</button>
              </span>
            </div>
          </li>
        </ul>
        <form v-if="kategoriTersedia.length" class="baris-input" @submit.prevent="tambahBatas">
          <select v-model="batasBaru.kategori" aria-label="Kategori">
            <option v-for="k in kategoriTersedia" :key="k" :value="k">{{ k }}</option>
          </select>
          <input v-model.number="batasBaru.nominal" type="number" min="0" step="50000" placeholder="Batas (Rp)" aria-label="Batas per bulan">
          <button class="tombol" type="submit">Tambah</button>
        </form>
      </section>

      <!-- Proyeksi -->
      <section class="kartu">
        <div class="judul-bagian"><h2>🔮 Proyeksi</h2></div>

        <h3>Perkiraan akhir bulan ini</h3>
        <dl class="rincian">
          <div><dt>Saldo bulan ini</dt><dd>{{ formatRupiah(ramalan.sisaAkhirBulan + ramalan.rutinBelumBayar) }}</dd></div>
          <div><dt>Dana rutin belum dibayar</dt><dd class="minus">−{{ formatRupiah(ramalan.rutinBelumBayar) }}</dd></div>
          <div class="total"><dt>Perkiraan sisa</dt><dd :class="ramalan.sisaAkhirBulan >= 0 ? 'plus' : 'minus'">{{ formatRupiah(ramalan.sisaAkhirBulan) }}</dd></div>
        </dl>
        <p v-if="ramalan.targetTabungan" class="catatan">
          <template v-if="ramalan.sisaAkhirBulan >= ramalan.targetTabungan">
            ✅ Target tabungan {{ formatRupiah(ramalan.targetTabungan) }} diperkirakan tercapai. Jatah belanja sampai akhir bulan
            <strong>{{ formatRupiah(ramalan.jatahHarianBulanIni) }}/hari</strong> ({{ ramalan.sisaHari }} hari lagi).
          </template>
          <template v-else>
            ⚠️ Masih kurang {{ formatRupiah(ramalan.targetTabungan - ramalan.sisaAkhirBulan) }} dari target tabungan bulan ini.
          </template>
        </p>

        <h3>Rencana alokasi per bulan</h3>
        <dl class="rincian">
          <div><dt>Pemasukan rata-rata</dt><dd>{{ formatRupiah(ramalan.pemasukanRata) }}</dd></div>
          <div><dt>Dana rutin</dt><dd class="minus">−{{ formatRupiah(ramalan.totalRutin) }}</dd></div>
          <div><dt>Target tabungan</dt><dd class="minus">−{{ formatRupiah(ramalan.targetTabungan) }}</dd></div>
          <div class="total"><dt>Dana bebas dipakai</dt><dd :class="ramalan.danaBebas >= 0 ? 'plus' : 'minus'">{{ formatRupiah(ramalan.danaBebas) }}</dd></div>
        </dl>
        <p class="catatan">≈ <strong>{{ formatRupiah(ramalan.jatahHarian) }}</strong> per hari. Dihitung dari {{ ramalan.dasarBulan ? `rata-rata ${ramalan.dasarBulan} bulan terakhir` : 'data bulan ini' }}.</p>

        <h3>Kalau pola sekarang berlanjut</h3>
        <div class="kedepan">
          <div v-for="k in ramalan.tabunganKedepan" :key="k.bulan">
            <small>{{ k.bulan }} bulan</small>
            <strong :class="k.nominal >= 0 ? 'plus' : 'minus'">{{ k.nominal >= 0 ? '+' : '' }}{{ formatRupiah(k.nominal) }}</strong>
          </div>
        </div>
      </section>
    </div>

    <!-- Dana rutin & pengingat -->
    <section class="kartu">
      <div class="judul-bagian">
        <h2>🔔 Dana Rutin &amp; Pengingat</h2>
        <small>{{ formatRupiah(ramalan.totalRutin) }}/bulan</small>
      </div>

      <p v-if="daftarRutin.length === 0" class="kosong-kecil">Belum ada dana rutin. Tambahkan tagihan bulanan seperti listrik, kos, atau cicilan.</p>
      <ul v-else class="daftar-rutin">
        <li v-for="r in daftarRutin" :key="r.id" :class="r.status">
          <div class="info">
            <strong>{{ r.nama }}</strong>
            <small>{{ r.kategori }} · tiap tgl {{ r.tanggal }}</small>
          </div>
          <div class="kanan">
            <span class="nominal">{{ formatRupiah(r.nominal) }}</span>
            <span class="chip" :class="r.status">{{ labelStatus(r) }}</span>
          </div>
          <div class="aksi-kecil">
            <button v-if="r.status !== 'lunas'" class="tombol kecil utama" @click="tandaiDibayar(r)">Tandai dibayar</button>
            <span>
              <button class="link" @click="mulaiEditRutin(r)">Edit</button>
              <button class="link hapus" @click="konfirmasiHapusRutin(r)">Hapus</button>
            </span>
          </div>
        </li>
      </ul>

      <form class="form-rutin" @submit.prevent="simpanRutin">
        <h3>{{ editRutin ? 'Edit dana rutin' : 'Tambah dana rutin' }}</h3>
        <label>Nama <input v-model="formRutin.nama" type="text" maxlength="60" placeholder="Contoh: Listrik" required></label>
        <div class="dua">
          <label>Nominal (Rp) <input v-model.number="formRutin.nominal" type="number" min="0" step="10000" required></label>
          <label>Tiap tanggal <input v-model.number="formRutin.tanggal" type="number" min="1" max="31" required></label>
        </div>
        <label>Kategori
          <select v-model="formRutin.kategori">
            <option v-for="k in KATEGORI.pengeluaran" :key="k" :value="k">{{ k }}</option>
          </select>
        </label>
        <div class="aksi">
          <button class="tombol utama" type="submit">{{ editRutin ? 'Simpan' : 'Tambah' }}</button>
          <button v-if="editRutin" class="tombol" type="button" @click="batalRutin">Batal</button>
        </div>
        <small class="petunjuk">Klik "Tandai dibayar" untuk otomatis mencatat pengeluarannya.</small>
      </form>
    </section>
  </div>
</template>

<style scoped>
.judul { font-size: 1.3rem; margin: 0; }
.sub { margin: 4px 0 0; color: var(--teks-redup); }
.grid { display: grid; gap: 20px; }
.kolom { display: flex; flex-direction: column; gap: 20px; }
@media (min-width: 900px) { .grid { grid-template-columns: 1fr 1fr; align-items: start; } }
.kartu h3 { font-size: 0.95rem; margin: 18px 0 8px; }
.judul-bagian small { color: var(--teks-redup); }
.baris-input { display: flex; gap: 8px; }
.baris-input input, .baris-input select { flex: 1; min-width: 0; }
.progres, .daftar-batas li { margin-top: 10px; }
.daftar-batas { list-style: none; padding: 0; margin: 0 0 12px; }
.daftar-batas li { padding-bottom: 10px; border-bottom: 1px solid var(--garis); }
.progres-label { display: flex; justify-content: space-between; gap: 8px; font-size: 0.9rem; margin-bottom: 4px; }
.batang-latar { height: 8px; border-radius: 99px; background: var(--latar); overflow: hidden; }
.batang-isi { height: 100%; border-radius: 99px; background: var(--hijau); transition: width 0.4s ease; }
.batang-isi.tabungan { background: linear-gradient(90deg, var(--hiasan-b), var(--hiasan-a)); }
.batang-isi.waspada { background: var(--kuning); }
.batang-isi.lewat { background: var(--merah); }
strong.waspada, small.waspada { color: var(--kuning); }
strong.lewat, small.lewat { color: var(--merah); }
.aksi-kecil { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 4px; font-size: 0.85rem; }
.aksi-kecil small { color: var(--teks-redup); }
.link { background: none; border: none; padding: 0 0 0 10px; color: var(--utama); cursor: pointer; font: inherit; font-size: 0.85rem; }
.link.hapus { color: var(--merah); }
.kosong-kecil { color: var(--teks-redup); font-size: 0.9rem; margin: 0 0 12px; }

.rincian { margin: 0; display: grid; gap: 6px; font-size: 0.9rem; }
.rincian div { display: flex; justify-content: space-between; gap: 8px; }
.rincian dt { color: var(--teks-redup); }
.rincian dd { margin: 0; font-weight: 600; }
.rincian .total { border-top: 1px dashed var(--garis); padding-top: 6px; font-weight: 700; }
.rincian .total dt { color: var(--teks); }
.plus { color: var(--hijau); }
.minus { color: var(--merah); }
.catatan { font-size: 0.85rem; color: var(--teks-redup); margin: 8px 0 0; }
.catatan strong { color: var(--teks); }
.kedepan { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.kedepan div { background: var(--latar); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; }
.kedepan small { color: var(--teks-redup); font-size: 0.8rem; }
.kedepan strong { font-size: 0.95rem; }

.daftar-rutin { list-style: none; padding: 0; margin: 0; }
.daftar-rutin li {
  display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; padding: 12px 0 12px 12px;
  border-bottom: 1px solid var(--garis); border-left: 3px solid transparent;
}
.daftar-rutin li.terlambat, .daftar-rutin li.hari-ini { border-left-color: var(--merah); }
.daftar-rutin li.segera { border-left-color: var(--kuning); }
.daftar-rutin li.lunas { opacity: 0.65; }
.daftar-rutin .info { display: flex; flex-direction: column; }
.daftar-rutin .info small { color: var(--teks-redup); }
.daftar-rutin .kanan { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.daftar-rutin .nominal { font-weight: 700; }
.daftar-rutin .aksi-kecil { grid-column: 1 / -1; }
.chip { font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; background: var(--latar); color: var(--teks-redup); white-space: nowrap; }
.chip.terlambat, .chip.hari-ini { background: var(--merah-muda); color: var(--merah); }
.chip.segera { background: var(--kuning-muda); color: var(--kuning); }
.chip.lunas { background: var(--hijau-muda); color: var(--hijau); }
.tombol.kecil { padding: 5px 12px; font-size: 0.8rem; }

.form-rutin { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.form-rutin h3 { margin-bottom: 0; }
.dua { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.aksi { display: flex; gap: 8px; }
.petunjuk { color: var(--teks-redup); font-size: 0.8rem; }

.siapkan ol { padding-left: 20px; display: grid; gap: 10px; }
.siapkan h2 { margin-top: 0; }
</style>
