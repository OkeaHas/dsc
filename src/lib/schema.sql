-- ═══════════════════════════════════════════════════════════════════════════
-- DSC Profile — Skema Database (Supabase / PostgreSQL)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Cara pakai: buka Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Skrip ini AMAN dijalankan berulang kali (idempotent).
--
-- Ringkasan tabel:
--   members     → daftar anggota + kolom `points` untuk leaderboard
--   news        → artikel/berita, punya `slug` unik untuk URL yang ramah SEO
--   events      → agenda/roadmap kegiatan + tombol buka/tutup pendaftaran
--   attendance  → absen peserta, berelasi ke events
--   feedback    → kotak kritik & saran
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── 1. MEMBERS ────────────────────────────────────────────────────────────
create table if not exists members (
  id            uuid primary key default gen_random_uuid(),
  name          varchar(255) not null,
  role          varchar(255) not null,
  photo_url     text,
  social_links  jsonb not null default '{}'::jsonb,
  points        integer not null default 0,
  created_at    timestamptz not null default timezone('utc'::text, now()),
  updated_at    timestamptz not null default timezone('utc'::text, now())
);

-- `points` tidak boleh negatif — leaderboard jadi tidak masuk akal kalau iya.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'members_points_non_negative'
  ) then
    alter table members
      add constraint members_points_non_negative check (points >= 0);
  end if;
end $$;

-- Leaderboard selalu `order by points desc` — beri index supaya tidak full scan.
create index if not exists members_points_idx on members (points desc, name asc);

-- ─── 2. NEWS ───────────────────────────────────────────────────────────────
create table if not exists news (
  id               uuid primary key default gen_random_uuid(),
  title            varchar(255) not null,
  slug             varchar(255) unique not null,
  content          text not null,
  cover_image_url  text,
  created_at       timestamptz not null default timezone('utc'::text, now()),
  updated_at       timestamptz not null default timezone('utc'::text, now())
);

-- Daftar berita selalu diurutkan terbaru dulu.
create index if not exists news_created_at_idx on news (created_at desc);

-- ─── 3. EVENTS ─────────────────────────────────────────────────────────────
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  title        varchar(255) not null,
  description  text,
  event_date   timestamptz not null,
  location     varchar(255),
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default timezone('utc'::text, now()),
  updated_at   timestamptz not null default timezone('utc'::text, now())
);

-- Halaman depan & roadmap menyaring "agenda terdekat" (event_date >= now()).
create index if not exists events_event_date_idx on events (event_date desc);
create index if not exists events_upcoming_idx on events (event_date asc)
  where is_active = true;

-- ─── 4. ATTENDANCE ─────────────────────────────────────────────────────────
create table if not exists attendance (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references events (id) on delete cascade,
  participant_name   varchar(255) not null,
  participant_email  varchar(255) not null,
  institution        varchar(255),
  created_at         timestamptz not null default timezone('utc'::text, now())
);

create index if not exists attendance_event_id_idx on attendance (event_id);

-- Satu email hanya boleh absen SEKALI per kegiatan. Tanpa index ini, orang bisa
-- menekan tombol daftar dua kali dan muncul sebagai dua baris.
create unique index if not exists attendance_unique_per_event_idx
  on attendance (event_id, lower(participant_email));

-- ─── 5. FEEDBACK ───────────────────────────────────────────────────────────
create table if not exists feedback (
  id            uuid primary key default gen_random_uuid(),
  sender_name   varchar(255) not null default 'Anonymous',
  sender_email  varchar(255),
  message       text not null,
  created_at    timestamptz not null default timezone('utc'::text, now())
);

create index if not exists feedback_created_at_idx on feedback (created_at desc);

-- ─── 6. TRIGGER updated_at ─────────────────────────────────────────────────
-- Tanpa trigger, kolom `updated_at` cuma jadi hiasan yang nilainya basi.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists members_set_updated_at on members;
create trigger members_set_updated_at
  before update on members
  for each row execute function set_updated_at();

drop trigger if exists news_set_updated_at on news;
create trigger news_set_updated_at
  before update on news
  for each row execute function set_updated_at();

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Prinsipnya:
--   anon            → boleh BACA konten publik, boleh TULIS absen & feedback.
--   service_role    → menembus RLS, dipakai semua operasi admin.
--
-- Tanpa ini, anon key yang beredar di browser bisa membaca kotak masuk
-- feedback dan menghapus data. RLS adalah satu-satunya lapisan yang benar-benar
-- memisahkan publik dari admin di Supabase.

alter table members    enable row level security;
alter table news       enable row level security;
alter table events     enable row level security;
alter table attendance enable row level security;
alter table feedback   enable row level security;

-- ── members: publik boleh baca, hanya admin yang boleh menulis ─────────────
drop policy if exists "members_publik_baca" on members;
create policy "members_publik_baca" on members
  for select to anon, authenticated using (true);

-- ── news: publik boleh baca ───────────────────────────────────────────────
drop policy if exists "news_publik_baca" on news;
create policy "news_publik_baca" on news
  for select to anon, authenticated using (true);

-- ── events: publik boleh baca ─────────────────────────────────────────────
drop policy if exists "events_publik_baca" on events;
create policy "events_publik_baca" on events
  for select to anon, authenticated using (true);

-- ── attendance: publik boleh MENDAFTAR, tidak boleh membaca daftar ────────
drop policy if exists "attendance_publik_daftar" on attendance;
create policy "attendance_publik_daftar" on attendance
  for insert to anon, authenticated with check (
    -- Hanya boleh absen di kegiatan yang pendaftarannya masih dibuka.
    exists (
      select 1 from events
      where events.id = attendance.event_id
        and events.is_active = true
    )
  );

-- ── feedback: publik boleh MENGIRIM, tidak boleh membaca ──────────────────
drop policy if exists "feedback_publik_kirim" on feedback;
create policy "feedback_publik_kirim" on feedback
  for insert to anon, authenticated with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. STORAGE BUCKET untuk gambar
-- ═══════════════════════════════════════════════════════════════════════════
-- Bucket "images" menyimpan foto anggota, cover berita, dan banner kegiatan.
-- Semua file diunggah lewat server pakai service role, jadi tidak perlu policy
-- INSERT untuk anon — cukup policy SELECT supaya gambarnya bisa ditampilkan.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  2097152, -- 2 MB, selaras dengan MAX_IMAGE_SIZE_BYTES di src/utils/uploadImage.ts
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "images_publik_baca" on storage.objects;
create policy "images_publik_baca" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'images');
