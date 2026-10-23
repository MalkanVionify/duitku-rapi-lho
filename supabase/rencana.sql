-- Tabel untuk menu Target: target bulanan & dana rutin (pengingat)
-- Jalankan sekali di Supabase: Dashboard → SQL Editor → New query → tempel → Run

-- Target bulanan: target tabungan (kategori kosong) atau batas pengeluaran per kategori
create table if not exists public.target_bulanan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jenis text not null check (jenis in ('tabungan', 'batas')),
  kategori text not null default '',
  nominal bigint not null check (nominal > 0),
  created_at timestamptz not null default now(),
  unique (user_id, jenis, kategori)
);

-- Dana rutin: pengeluaran yang berulang tiap bulan di tanggal tertentu (listrik, kos, cicilan, ...)
create table if not exists public.dana_rutin (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nama text not null,
  kategori text not null,
  nominal bigint not null check (nominal > 0),
  tanggal smallint not null check (tanggal between 1 and 31),
  created_at timestamptz not null default now()
);

-- Row Level Security: setiap user HANYA bisa mengakses datanya sendiri
alter table public.target_bulanan enable row level security;
alter table public.dana_rutin enable row level security;

drop policy if exists "Kelola target sendiri" on public.target_bulanan;
create policy "Kelola target sendiri" on public.target_bulanan
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Kelola dana rutin sendiri" on public.dana_rutin;
create policy "Kelola dana rutin sendiri" on public.dana_rutin
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
