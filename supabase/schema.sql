-- Skema database Duitku Rapi Lho
-- Jalankan sekali di Supabase: Dashboard → SQL Editor → New query → tempel → Run

create table if not exists public.transaksi (
  id uuid primary key default gen_random_uuid(),
  -- Otomatis diisi dengan id user yang sedang login
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jenis text not null check (jenis in ('pemasukan', 'pengeluaran')),
  nominal bigint not null check (nominal > 0),
  kategori text not null,
  tanggal date not null,
  catatan text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists transaksi_user_tanggal_idx on public.transaksi (user_id, tanggal desc);

-- Row Level Security: setiap user HANYA bisa mengakses transaksinya sendiri
alter table public.transaksi enable row level security;

drop policy if exists "Lihat transaksi sendiri" on public.transaksi;
create policy "Lihat transaksi sendiri" on public.transaksi
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Tambah transaksi sendiri" on public.transaksi;
create policy "Tambah transaksi sendiri" on public.transaksi
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Ubah transaksi sendiri" on public.transaksi;
create policy "Ubah transaksi sendiri" on public.transaksi
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Hapus transaksi sendiri" on public.transaksi;
create policy "Hapus transaksi sendiri" on public.transaksi
  for delete to authenticated using ((select auth.uid()) = user_id);
