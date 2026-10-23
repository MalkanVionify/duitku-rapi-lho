<script setup lang="ts">
import { useTransaksi } from '~/composables/useTransaksi'

useHead({ title: 'Duitku Wrapped · Duitku Rapi Lho' })

const { terurut, memuat } = useTransaksi()

// --- Pilihan periode ---
const mode = ref<ModeWrapped>('bulan')
const pilihBulan = ref(bulanIni())
const pilihTahun = ref(bulanIni().slice(0, 4))
const daftarTahun = computed(() => {
  const tahun = new Set([bulanIni().slice(0, 4), ...terurut.value.map((t) => t.tanggal.slice(0, 4))])
  return [...tahun].sort().reverse()
})
const periode = computed(() => (mode.value === 'bulan' ? pilihBulan.value : pilihTahun.value))

const w = computed(() => hitungWrapped(terurut.value, mode.value, periode.value))

// --- Daftar slide (slide tanpa data dilewati) ---
const slide = computed(() => {
  if (!w.value) return []
  return [
    'pembuka',
    'jumlah',
    'arus',
    w.value.kategori.length && 'kategori',
    w.value.polaPuncak && 'pola',
    (w.value.keluarTerbesar || w.value.masukTerbesar) && 'terbesar',
    'streak',
    'persona',
    'penutup',
  ].filter(Boolean) as string[]
})

// Judul tiap slide untuk daftar slide (hanya tampil di desktop)
function labelSlide(s: string) {
  const label: Record<string, string> = {
    pembuka: 'Pembuka',
    jumlah: 'Jumlah transaksi',
    arus: 'Uang masuk & keluar',
    kategori: 'Kategori favorit',
    pola: mode.value === 'bulan' ? 'Hari paling boros' : 'Bulan paling boros',
    terbesar: 'Transaksi terbesar',
    streak: 'Rekor mencatat',
    persona: 'Kepribadian keuangan',
    penutup: 'Kartu ringkasan',
  }
  return label[s] ?? s
}

// --- Navigasi ala stories ---
const indeks = ref(0)
const jeda = ref(false)
const aktif = computed(() => slide.value[indeks.value])
const terakhir = computed(() => indeks.value === slide.value.length - 1)

watch(periode, () => (indeks.value = 0))
watch(mode, () => (indeks.value = 0))

function maju() {
  if (!terakhir.value) indeks.value++
}
function mundur() {
  if (indeks.value > 0) indeks.value--
}
function ulangi() {
  indeks.value = 0
  jeda.value = false
}

// Ketuk sebentar = pindah slide (kiri: mundur, kanan: maju). Tahan = jeda.
let mulaiTekan = 0
function tekan() {
  mulaiTekan = Date.now()
  jeda.value = true
}
function lepas(e: PointerEvent) {
  jeda.value = false
  if (Date.now() - mulaiTekan > 250) return
  const kotak = (e.currentTarget as HTMLElement).getBoundingClientRect()
  if (e.clientX - kotak.left < kotak.width * 0.3) mundur()
  else maju()
}

function tombolKeyboard(e: KeyboardEvent) {
  if (!w.value || (e.target as HTMLElement).closest('input, select')) return
  if (e.key === 'ArrowRight') maju()
  else if (e.key === 'ArrowLeft') mundur()
  else if (e.key === ' ') {
    e.preventDefault()
    jeda.value = !jeda.value
  }
}
onMounted(() => window.addEventListener('keydown', tombolKeyboard))
onUnmounted(() => window.removeEventListener('keydown', tombolKeyboard))

const pesanSisa = computed(() => {
  if (!w.value || w.value.persenSisa === null) return 'Belum ada pemasukan yang tercatat di periode ini.'
  if (w.value.persenSisa >= 0) return `Kamu berhasil menyisihkan ${w.value.persenSisa}% pemasukanmu 🎉`
  return 'Pengeluaran sedikit lebih besar dari pemasukan. Periode depan pasti lebih baik 💪'
})
const pesanStreak = computed(() => {
  const s = w.value?.streak ?? 0
  if (s >= 7) return 'Konsisten banget! Kamu juara mencatat 🏆'
  if (s >= 3) return 'Mantap, pertahankan kebiasaan baik ini!'
  return 'Yuk lebih rajin mencatat setiap hari ✍️'
})
const polaMaks = computed(() => Math.max(1, ...(w.value?.pola.map((p) => p.nominal) ?? [1])))
</script>

<template>
  <section class="wrapped">
    <div class="kepala">
      <div>
        <h1>Duitku Wrapped</h1>
        <p>Cerita keuanganmu, dirangkum jadi satu.</p>
      </div>
      <div class="periode">
        <div class="mode" role="tablist">
          <button type="button" role="tab" :aria-selected="mode === 'bulan'" :class="{ aktif: mode === 'bulan' }" @click="mode = 'bulan'">Bulanan</button>
          <button type="button" role="tab" :aria-selected="mode === 'tahun'" :class="{ aktif: mode === 'tahun' }" @click="mode = 'tahun'">Tahunan</button>
        </div>
        <input v-if="mode === 'bulan'" v-model="pilihBulan" type="month" aria-label="Pilih bulan">
        <select v-else v-model="pilihTahun" aria-label="Pilih tahun">
          <option v-for="t in daftarTahun" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
    </div>

    <p v-if="memuat" class="kartu kosong">Memuat data…</p>

    <div v-else-if="!w" class="kartu kosong">
      <p>Belum ada transaksi di {{ mode === 'bulan' ? formatBulan(periode) : `tahun ${periode}` }}.</p>
      <NuxtLink to="/transaksi" class="tombol utama">Catat transaksi dulu yuk</NuxtLink>
    </div>

    <template v-else>
      <div
        class="story"
        :class="`latar-${aktif}`"
        role="region"
        aria-roledescription="carousel"
        :aria-label="`Slide ${indeks + 1} dari ${slide.length}`"
        @pointerdown="tekan"
        @pointerup="lepas"
        @pointerleave="jeda = false"
      >
        <!-- Progress ala stories -->
        <div class="progress">
          <span v-for="(s, i) in slide" :key="s" class="segmen">
            <i
              :key="`${s}-${indeks}`"
              :class="{ penuh: i < indeks || (i === indeks && terakhir), jalan: i === indeks && !terakhir }"
              :style="{ animationPlayState: jeda ? 'paused' : 'running' }"
              @animationend="maju"
            />
          </span>
        </div>

        <!-- Hiasan latar -->
        <div class="hiasan" aria-hidden="true">
          <span class="bulat b1" /><span class="bulat b2" /><span class="bulat b3" />
          <span class="kilau k1">✦</span><span class="kilau k2">✦</span><span class="kilau k3">✦</span>
        </div>

        <Transition name="ganti" mode="out-in">
          <div :key="aktif" class="isi">
            <!-- 1. Pembuka -->
            <template v-if="aktif === 'pembuka'">
              <span class="lencana muncul">Duitku Wrapped</span>
              <h2 class="raksasa muncul d1">{{ w.judulPeriode }}</h2>
              <p class="besar muncul d2">Siap lihat ke mana saja uangmu pergi?</p>
              <p class="kecil muncul d3">Ketuk untuk mulai →</p>
            </template>

            <!-- 2. Jumlah transaksi -->
            <template v-else-if="aktif === 'jumlah'">
              <p class="besar muncul">Kamu mencatat</p>
              <h2 class="angka-raksasa teks-gradasi muncul d1">{{ w.jumlahTransaksi }}</h2>
              <p class="besar muncul d2">transaksi</p>
              <p class="sedang muncul d3">dalam <strong>{{ w.jumlahHari }} hari</strong> berbeda</p>
            </template>

            <!-- 3. Arus uang -->
            <template v-else-if="aktif === 'arus'">
              <p class="besar muncul">Uang yang mengalir</p>
              <div class="arus muncul d1">
                <div><small>Masuk</small><strong>+{{ formatRupiah(w.pemasukan) }}</strong></div>
                <div><small>Keluar</small><strong>−{{ formatRupiah(w.pengeluaran) }}</strong></div>
              </div>
              <p class="sedang muncul d2">{{ pesanSisa }}</p>
            </template>

            <!-- 4. Kategori favorit -->
            <template v-else-if="aktif === 'kategori'">
              <p class="besar muncul">Kategori favoritmu</p>
              <div class="emoji-raksasa muncul d1">{{ w.kategori[0]!.emoji }}</div>
              <h2 class="raksasa muncul d1">{{ w.kategori[0]!.kategori }}</h2>
              <ol class="peringkat muncul d2">
                <li v-for="(k, i) in w.kategori" :key="k.kategori">
                  <span class="nomor">{{ i + 1 }}</span>
                  <span class="nama">{{ k.emoji }} {{ k.kategori }}</span>
                  <span class="nilai">{{ k.persen }}%</span>
                  <span class="garis-isi" :style="{ width: `${k.persen}%` }" />
                </li>
              </ol>
            </template>

            <!-- 5. Hari / bulan paling boros -->
            <template v-else-if="aktif === 'pola' && w.polaPuncak">
              <p class="besar muncul">{{ mode === 'bulan' ? 'Hari paling boros' : 'Bulan paling boros' }}</p>
              <h2 class="raksasa teks-gradasi muncul d1">{{ w.polaPuncak.nama }}</h2>
              <p class="sedang muncul d2">Total {{ formatRupiah(w.polaPuncak.nominal) }}</p>
              <div class="grafik muncul d3" :class="{ rapat: mode === 'tahun' }">
                <div v-for="p in w.pola" :key="p.label" class="kolom-grafik">
                  <span class="batang" :class="{ puncak: p.label === w.polaPuncak.label }" :style="{ height: `${Math.max(4, (p.nominal / polaMaks) * 100)}%` }" />
                  <small>{{ p.label }}</small>
                </div>
              </div>
            </template>

            <!-- 6. Transaksi terbesar -->
            <template v-else-if="aktif === 'terbesar'">
              <template v-if="w.keluarTerbesar">
                <p class="besar muncul">Pengeluaran terbesarmu</p>
                <h2 class="raksasa muncul d1">{{ w.keluarTerbesar.catatan || w.keluarTerbesar.kategori }}</h2>
                <p class="angka-besar muncul d2">{{ formatRupiah(w.keluarTerbesar.nominal) }}</p>
                <p class="sedang muncul d2">{{ formatTanggal(w.keluarTerbesar.tanggal) }} · {{ w.keluarTerbesar.kategori }}</p>
              </template>
              <div v-if="w.masukTerbesar" class="kotak-kaca muncul d3">
                <small>Pemasukan terbesar</small>
                <strong>{{ w.masukTerbesar.catatan || w.masukTerbesar.kategori }} · +{{ formatRupiah(w.masukTerbesar.nominal) }}</strong>
              </div>
            </template>

            <!-- 7. Streak -->
            <template v-else-if="aktif === 'streak'">
              <div class="emoji-raksasa muncul">🔥</div>
              <p class="besar muncul d1">Rekor mencatat</p>
              <h2 class="angka-raksasa teks-gradasi muncul d1">{{ w.streak }}</h2>
              <p class="besar muncul d2">hari berturut-turut</p>
              <p class="sedang muncul d3">{{ pesanStreak }}</p>
            </template>

            <!-- 8. Persona -->
            <template v-else-if="aktif === 'persona'">
              <p class="besar muncul">Kepribadian keuanganmu</p>
              <div class="emoji-raksasa muncul d1">{{ w.persona.emoji }}</div>
              <h2 class="raksasa muncul d2">{{ w.persona.nama }}</h2>
              <p class="sedang muncul d3">{{ w.persona.deskripsi }}</p>
            </template>

            <!-- 9. Penutup -->
            <template v-else-if="aktif === 'penutup'">
              <div class="kartu-akhir muncul">
                <span class="lencana">Duitku Wrapped · {{ w.judulPeriode }}</span>
                <div class="persona-akhir">{{ w.persona.emoji }} {{ w.persona.nama }}</div>
                <dl>
                  <div><dt>Transaksi</dt><dd>{{ w.jumlahTransaksi }}</dd></div>
                  <div><dt>Rekor</dt><dd>{{ w.streak }} hari 🔥</dd></div>
                  <div v-if="w.kategori[0]"><dt>Favorit</dt><dd>{{ w.kategori[0].emoji }} {{ w.kategori[0].kategori }}</dd></div>
                  <div v-if="w.polaPuncak"><dt>{{ mode === 'bulan' ? 'Hari boros' : 'Bulan boros' }}</dt><dd>{{ w.polaPuncak.nama }}</dd></div>
                  <div class="lebar"><dt>Selisih</dt><dd :class="w.saldo >= 0 ? 'plus' : 'minus'">{{ w.saldo >= 0 ? '+' : '−' }}{{ formatRupiah(Math.abs(w.saldo)) }}</dd></div>
                </dl>
              </div>
              <p class="sedang muncul d2">Sampai jumpa di Wrapped berikutnya 💖</p>
            </template>
          </div>
        </Transition>
      </div>

      <div class="kendali">
        <button type="button" class="tombol" :disabled="indeks === 0" aria-label="Slide sebelumnya" @click="mundur">‹</button>
        <button v-if="terakhir" type="button" class="tombol utama" @click="ulangi">↺ Putar ulang</button>
        <button v-else type="button" class="tombol" :aria-label="jeda ? 'Lanjutkan' : 'Jeda'" @click="jeda = !jeda">{{ jeda ? '▶' : '❚❚' }}</button>
        <button type="button" class="tombol" :disabled="terakhir" aria-label="Slide berikutnya" @click="maju">›</button>
      </div>
      <p class="petunjuk">Ketuk kanan/kiri untuk pindah · tahan untuk jeda</p>

      <ol class="daftar-slide">
        <li v-for="(s, i) in slide" :key="s">
          <button type="button" :class="{ aktif: i === indeks, lewat: i < indeks }" @click="indeks = i">
            <span class="nomor">{{ i + 1 }}</span>
            {{ labelSlide(s) }}
          </button>
        </li>
      </ol>
    </template>
  </section>
</template>

<style scoped>
/* Palet Wrapped: tetap pink-biru-putih di mode terang maupun gelap */
.wrapped {
  --w-pink: #ff5fa2;
  --w-pink-tua: #db2777;
  --w-biru: #2563eb;
  --w-navy: #1c2340;
  display: flex; flex-direction: column; gap: 16px;
}
.kepala { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 12px; }
.kepala h1 { margin: 0; font-size: 1.4rem; }
.kepala p { margin: 2px 0 0; color: var(--teks-redup); }
.periode { display: flex; gap: 8px; align-items: center; }
.periode input, .periode select { width: auto; }
.mode { display: flex; background: var(--kartu); border: 1px solid var(--garis); border-radius: 10px; padding: 3px; }
.mode button {
  font: inherit; font-size: 0.85rem; font-weight: 600; border: none; background: none; cursor: pointer;
  padding: 6px 12px; border-radius: 8px; color: var(--teks-redup);
}
.mode button.aktif { background: var(--sorot-muda); color: var(--sorot); }
.kosong { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.kosong .tombol { text-decoration: none; }

/* --- Kartu story --- */
.story {
  position: relative; overflow: hidden; align-self: center;
  width: min(100%, 400px); height: clamp(540px, calc(100svh - 230px), 680px);
  border-radius: 24px; color: #fff; user-select: none; cursor: pointer; touch-action: manipulation;
  box-shadow: 0 20px 50px -20px rgba(37, 99, 235, 0.45);
  transition: background 0.6s ease;
}
.latar-pembuka, .latar-terbesar { background: linear-gradient(160deg, var(--w-biru) 0%, var(--w-pink-tua) 100%); }
.latar-jumlah, .latar-streak { background: #fff; color: var(--w-navy); }
.latar-arus, .latar-persona { background: linear-gradient(160deg, #c2185b 0%, #ec4899 100%); }
.latar-kategori { background: linear-gradient(160deg, #1e3a8a 0%, #3b82f6 100%); }
.latar-pola, .latar-penutup { background: linear-gradient(160deg, #ffe4f1 0%, #dbeafe 100%); color: var(--w-navy); }

.progress { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; gap: 4px; z-index: 3; }
.segmen { flex: 1; height: 3px; border-radius: 99px; background: rgba(255, 255, 255, 0.4); overflow: hidden; }
.latar-jumlah .segmen, .latar-streak .segmen, .latar-pola .segmen, .latar-penutup .segmen { background: rgba(28, 35, 64, 0.15); }
.segmen i { display: block; height: 100%; width: 0; background: currentColor; }
.segmen i.penuh { width: 100%; }
.segmen i.jalan { animation: isi-progress 6s linear forwards; }
@keyframes isi-progress { to { width: 100%; } }

/* Hiasan bulat & kilau yang melayang */
.hiasan { position: absolute; inset: 0; pointer-events: none; }
.bulat { position: absolute; border-radius: 50%; filter: blur(2px); animation: melayang 9s ease-in-out infinite; }
.b1 { width: 220px; height: 220px; right: -70px; top: -60px; background: rgba(255, 255, 255, 0.16); }
.b2 { width: 140px; height: 140px; left: -50px; bottom: 60px; background: rgba(255, 255, 255, 0.12); animation-delay: -3s; }
.b3 { width: 70px; height: 70px; right: 40px; bottom: -20px; background: rgba(255, 255, 255, 0.2); animation-delay: -6s; }
.latar-jumlah .b1, .latar-streak .b1 { background: rgba(255, 95, 162, 0.18); }
.latar-jumlah .b2, .latar-streak .b2 { background: rgba(37, 99, 235, 0.14); }
.latar-jumlah .b3, .latar-streak .b3 { background: rgba(255, 95, 162, 0.22); }
.latar-pola .bulat, .latar-penutup .bulat { background: rgba(255, 255, 255, 0.55); }
.kilau { position: absolute; font-size: 1.1rem; opacity: 0.7; animation: berkilau 3s ease-in-out infinite; }
.k1 { top: 18%; left: 12%; } .k2 { top: 30%; right: 14%; animation-delay: -1s; font-size: 0.8rem; } .k3 { bottom: 22%; right: 22%; animation-delay: -2s; }
.latar-jumlah .kilau, .latar-streak .kilau, .latar-pola .kilau, .latar-penutup .kilau { color: var(--w-pink); }
@keyframes melayang { 50% { transform: translate(10px, -14px) scale(1.05); } }
@keyframes berkilau { 50% { opacity: 0.2; transform: scale(0.7) rotate(20deg); } }

/* --- Isi slide --- */
.isi {
  position: relative; z-index: 2; height: 100%; padding: 48px 28px 32px;
  display: flex; flex-direction: column; justify-content: center; gap: 10px;
}
.isi h2, .isi p { margin: 0; }
.lencana {
  align-self: flex-start; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 5px 12px; border-radius: 99px; background: rgba(255, 255, 255, 0.22);
}
.raksasa { font-size: clamp(2rem, 9vw, 2.6rem); font-weight: 800; line-height: 1.1; overflow-wrap: anywhere; }
.angka-raksasa { font-size: clamp(4.5rem, 22vw, 6.5rem); font-weight: 900; line-height: 1; }
.angka-besar { font-size: 2rem; font-weight: 800; }
.emoji-raksasa { font-size: 4.5rem; line-height: 1; }
.besar { font-size: 1.25rem; font-weight: 700; }
.sedang { font-size: 1.05rem; font-weight: 600; opacity: 0.92; }
.kecil { font-size: 0.9rem; font-weight: 600; opacity: 0.85; margin-top: 16px !important; }
.teks-gradasi {
  align-self: flex-start; /* gradasi hanya selebar teks, bukan selebar kartu */
  background: linear-gradient(90deg, var(--w-biru), var(--w-pink-tua));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

.arus { display: grid; gap: 10px; margin: 8px 0; }
.arus div { background: rgba(255, 255, 255, 0.18); border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; }
.arus small { font-weight: 700; opacity: 0.9; }
.arus strong { font-size: 1.6rem; }

.peringkat { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 8px; }
.peringkat li {
  position: relative; overflow: hidden; display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 14px; background: rgba(255, 255, 255, 0.14); font-weight: 700;
}
.peringkat .nomor { width: 24px; height: 24px; border-radius: 50%; background: #fff; color: var(--w-biru); display: grid; place-items: center; font-size: 0.8rem; }
.peringkat .nama { flex: 1; }
.peringkat .garis-isi { position: absolute; left: 0; bottom: 0; height: 3px; background: #fff; }
.peringkat > li > * { position: relative; }

.grafik { display: flex; align-items: flex-end; gap: 8px; height: 150px; margin-top: 16px; }
.grafik.rapat { gap: 4px; }
.kolom-grafik { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 6px; }
.kolom-grafik small { font-size: 0.7rem; font-weight: 700; opacity: 0.75; }
.batang { width: 100%; border-radius: 8px 8px 4px 4px; background: rgba(37, 99, 235, 0.35); }
.batang.puncak { background: linear-gradient(180deg, var(--w-pink), var(--w-pink-tua)); }

.kotak-kaca { margin-top: 18px; padding: 12px 16px; border-radius: 16px; background: rgba(255, 255, 255, 0.18); display: flex; flex-direction: column; gap: 2px; }
.kotak-kaca small { font-weight: 700; opacity: 0.85; }

.kartu-akhir {
  background: #fff; color: var(--w-navy); border-radius: 20px; padding: 20px;
  box-shadow: 0 0 0 3px var(--w-pink), 0 0 0 6px var(--w-biru), 0 18px 40px -18px rgba(28, 35, 64, 0.5);
  display: flex; flex-direction: column; gap: 12px; margin-bottom: 10px;
}
.kartu-akhir .lencana { background: linear-gradient(90deg, var(--w-biru), var(--w-pink-tua)); color: #fff; }
.persona-akhir { font-size: 1.3rem; font-weight: 800; }
.kartu-akhir dl { margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kartu-akhir dl div { background: #f5f7ff; border-radius: 12px; padding: 8px 10px; }
.kartu-akhir dl .lebar { grid-column: 1 / -1; }
.kartu-akhir dt { font-size: 0.7rem; font-weight: 700; color: #5d6278; text-transform: uppercase; letter-spacing: 0.03em; }
.kartu-akhir dd { margin: 2px 0 0; font-weight: 800; }
.kartu-akhir .plus { color: #15803d; }
.kartu-akhir .minus { color: var(--w-pink-tua); }

/* Animasi masuk bertahap */
.muncul { animation: naik 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.d1 { animation-delay: 0.15s; } .d2 { animation-delay: 0.3s; } .d3 { animation-delay: 0.45s; }
@keyframes naik { from { opacity: 0; transform: translateY(18px); } }
.ganti-enter-active, .ganti-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.ganti-enter-from { opacity: 0; transform: scale(0.97); }
.ganti-leave-to { opacity: 0; transform: scale(1.03); }

.kendali { display: flex; justify-content: center; gap: 10px; }
.kendali .tombol { min-width: 48px; }
.kendali .tombol:disabled { opacity: 0.4; cursor: not-allowed; }
.petunjuk { text-align: center; font-size: 0.8rem; color: var(--teks-redup); margin: -6px 0 0; }

.daftar-slide { display: none; }

/* Desktop: panel kontrol + daftar slide di kiri, story di kanan */
@media (min-width: 1024px) {
  .wrapped {
    display: grid; grid-template-columns: minmax(0, 520px) 400px; grid-template-rows: auto auto auto auto 1fr;
    justify-content: center; column-gap: 72px; row-gap: 20px;
  }
  .kepala { grid-column: 1; grid-row: 1; flex-direction: column; align-items: flex-start; padding-top: 16px; }
  .kepala h1 { font-size: 2.2rem; }
  .kepala p { font-size: 1.05rem; }
  .daftar-slide { grid-column: 1; grid-row: 2; display: grid; gap: 4px; list-style: none; margin: 4px 0 0; padding: 0; }
  .kendali { grid-column: 1; grid-row: 3; justify-content: flex-start; }
  .petunjuk { grid-column: 1; grid-row: 4; text-align: left; margin: 0; }
  .story { grid-column: 2; grid-row: 1 / span 5; height: clamp(560px, calc(100vh - 80px), 700px); }
  .kosong { grid-column: 1 / -1; }
}
.daftar-slide button {
  width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer;
  font: inherit; font-weight: 600; font-size: 0.95rem; padding: 8px 12px; border-radius: 12px;
  border: 1px solid transparent; background: none; color: var(--teks-redup);
}
.daftar-slide button:hover { background: var(--kartu); border-color: var(--garis); }
.daftar-slide .nomor {
  width: 26px; height: 26px; flex: none; border-radius: 50%; display: grid; place-items: center;
  font-size: 0.8rem; border: 1px solid var(--garis); background: var(--kartu);
}
.daftar-slide .lewat { color: var(--teks); }
.daftar-slide .lewat .nomor { background: var(--sorot-muda); color: var(--sorot); border-color: transparent; }
.daftar-slide .aktif { background: var(--kartu); border-color: var(--garis); color: var(--teks); box-shadow: 0 6px 18px -12px rgba(37, 99, 235, 0.5); }
.daftar-slide .aktif .nomor { background: linear-gradient(135deg, var(--w-biru), var(--w-pink-tua)); color: #fff; border-color: transparent; }

@media (prefers-reduced-motion: reduce) {
  .bulat, .kilau, .muncul { animation: none; }
}
</style>
