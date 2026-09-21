# ARCHITECTURE.md - Mataram Dev

**Versi:** 0.1 **Status:** Draft **Terakhir diupdate:** 18 September 2026 **Referensi:** `PRD.md`

---

## 1. Tech Stack

| Layer         | Teknologi                                                  | Alasan                                                                                                                |
| ------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 14+ (App Router)                                   | SSR/SSG/ISR fleksibel, RSC untuk kurangi JS di client, native di Vercel                                               |
| Styling       | Tailwind CSS                                               | Sesuai design-guide (bento grid, konsisten dengan spacing/typography scale)                                           |
| Database      | Supabase (Postgres)                                        | Relational, cocok untuk data terstruktur (users, events, projects, dsb)                                               |
| Storage       | Supabase Storage                                           | Simpan image event, avatar, file resource                                                                             |
| Auth          | Supabase Auth                                              | Satu ekosistem dengan DB, support email/password + OAuth (GitHub)                                                     |
| Hosting       | Vercel                                                     | Native support Next.js, edge network, auto preview deployment                                                         |
| ORM/Query     | Drizzle ORM (rekomendasi) atau Supabase JS Client langsung | Drizzle kasih type-safety + migration yang jelas; bisa juga langsung pakai `@supabase/supabase-js` untuk kasus simpel |
| Validasi      | Zod                                                        | Validasi input form & API payload, integrasi mudah dengan TypeScript                                                  |
| Form handling | React Hook Form + Zod resolver                             | Standar untuk form kompleks (submit proyek, artikel)                                                                  |

> Catatan: Prisma juga valid sebagai alternatif Drizzle. Pilih salah satu di awal dan konsisten dipakai di seluruh project — jangan campur.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                  Client (Browser)             │
│   Next.js RSC + Client Components (islands)  │
└───────────────────┬───────────────────────────┘
                     │ HTTPS
┌───────────────────▼───────────────────────────┐
│              Next.js App (Vercel)              │
│  - Server Components (fetch data langsung)     │
│  - Server Actions (mutasi data: submit, RSVP)  │
│  - Route Handlers (/api/*) untuk webhook/3rd   │
│    party integration bila perlu                │
│  - Middleware (proteksi route admin/contributor)│
└───────────────────┬───────────────────────────┘
                     │ Supabase JS SDK
┌───────────────────▼───────────────────────────┐
│                   Supabase                     │
│  - Postgres (data)                             │
│  - Auth (session, OAuth)                       │
│  - Storage (image, file)                       │
│  - Row Level Security (RLS) untuk otorisasi     │
└─────────────────────────────────────────────────┘
```

**Prinsip utama:**

- Sebisa mungkin fetch data di **Server Component**, bukan client-side `useEffect` fetch — lebih cepat & SEO-friendly.
- Mutasi data (submit form, RSVP, dsb) pakai **Server Actions**, bukan bikin API route manual kecuali dibutuhkan untuk integrasi eksternal (misal webhook).
- Otorisasi ditegakkan di **dua lapis**: middleware Next.js (redirect kalau belum login/role gak sesuai) DAN Row Level Security di Supabase (jaga-jaga kalau ada request langsung ke DB, bukan cuma UI guard).

---

## 3. Folder Structure

```
mataram-dev/
├── app/
│   ├── (public)/                 # Route group: halaman publik
│   │   ├── page.tsx               # Landing page
│   │   ├── event/
│   │   │   ├── page.tsx           # List event
│   │   │   └── [slug]/page.tsx    # Detail event
│   │   ├── proyek/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── artikel/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── resource/page.tsx
│   │   ├── anggota/
│   │   │   ├── page.tsx           # Direktori anggota
│   │   │   └── [username]/page.tsx
│   │   └── tentang/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/               # Route group: butuh login
│   │   ├── layout.tsx             # Guard: cek session
│   │   ├── profil/page.tsx
│   │   ├── proyek-saya/page.tsx
│   │   └── artikel-saya/page.tsx
│   ├── admin/                     # Khusus admin → URL /admin/*
│   │   ├── layout.tsx             # Guard: cek role admin
│   │   ├── event/page.tsx
│   │   ├── proyek/page.tsx
│   │   ├── artikel/page.tsx
│   │   ├── resource/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── user/page.tsx
│   │   └── pengaturan/page.tsx
│   ├── api/                       # Route handlers (kalau perlu)
│   └── layout.tsx                 # Root layout (nav, footer, theme provider)
├── components/
│   ├── ui/                        # Komponen dasar (button, card, input, dsb)
│   ├── layout/                    # Navbar, mega menu, footer
│   ├── sections/                  # Section landing page (hero, stats, dsb)
│   └── forms/                     # Form-form spesifik (submit proyek, dsb)
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase client (browser)
│   │   ├── server.ts              # Supabase client (server component)
│   │   └── middleware.ts          # Helper untuk middleware auth
│   ├── validations/               # Skema Zod per entity
│   ├── actions/                   # Server actions per domain (event, proyek, dsb)
│   └── utils.ts
├── db/
│   ├── schema.ts                  # Drizzle schema (atau prisma.schema)
│   └── migrations/
├── types/
│   └── index.ts                   # Shared TypeScript types
├── middleware.ts                  # Proteksi route berdasarkan session & role
├── public/
└── styles/
    └── globals.css
```

> **Catatan route group:** folder dalam tanda kurung (`(public)`, `(auth)`, `(dashboard)`) **tidak** menambah segment URL — fungsinya cuma berbagi layout. Jadi `(public)/event/page.tsx` menghasilkan URL `/event`. Karena itu halaman admin tidak boleh ditaruh di `(admin)/event/` (akan bentrok dengan `/event` publik), melainkan di folder `admin/` biasa supaya URL-nya jadi `/admin/event`.

---

## 4. Database Schema (Detail)

### 4.1 `users`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)|Sinkron dengan `auth.users.id`|
|fullname|text||
|username|text (unique)||
|email|text (unique)|Sinkron dari `auth.users`|
|role|enum(`admin`, `contributor`)|Default `contributor`|
|image_url|text|Nullable|
|bio|text|Nullable|
|created_at|timestamptz||
|updated_at|timestamptz||

> Password TIDAK disimpan di tabel ini — dihandle oleh Supabase Auth.

### 4.2 `social_links`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|owner_type|enum(`user`, `community`)|Biar bisa dipakai user & community settings|
|owner_id|uuid|FK ke `users.id` atau `community_settings.id`|
|platform|text|github, linkedin, instagram, dll|
|url|text||

### 4.3 `events`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|slug|text (unique)||
|title|text||
|excerpt|text||
|description|text|Rich text/markdown|
|image_url|text||
|status|enum(`upcoming`, `ongoing`, `completed`, `cancelled`)||
|start_time|timestamptz||
|end_time|timestamptz||
|location_name|text||
|location_url|text|Nullable (link maps)|
|created_by|uuid|FK ke `users.id`|
|created_at|timestamptz||

### 4.4 `event_rsvp`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|event_id|uuid|FK ke `events.id`|
|user_id|uuid|FK ke `users.id`|
|status|enum(`going`, `cancelled`)||
|created_at|timestamptz||

Unique constraint: (`event_id`, `user_id`)

### 4.5 `activities`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|name|text||
|description|text||
|icon|text||
|color|text||
|order|int||

### 4.6 `projects`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|slug|text (unique)||
|name|text||
|image_url|text||
|content|text||
|github_url|text|Nullable|
|demo_url|text|Nullable|
|status|enum(`pending`, `approved`, `rejected`)|Moderasi admin|
|created_at|timestamptz||

### 4.7 `project_contributors`

|Kolom|Tipe|Keterangan|
|---|---|---|
|project_id|uuid|FK ke `projects.id`|
|user_id|uuid|FK ke `users.id`|

Primary key gabungan: (`project_id`, `user_id`)

### 4.8 `stacks`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|name|text (unique)|React, Laravel, Figma, dsb|

### 4.9 `project_stacks`

|Kolom|Tipe|Keterangan|
|---|---|---|
|project_id|uuid|FK ke `projects.id`|
|stack_id|uuid|FK ke `stacks.id`|

### 4.10 `free_resources`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|name|text||
|file_url|text|Path di Supabase Storage|
|icon|text||
|category|enum(`code`, `doc`, `design`, `video`)||
|download_count|int|Default 0|
|created_at|timestamptz||

### 4.11 `posts`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|slug|text (unique)||
|title|text||
|excerpt|text||
|image_url|text||
|content|text|Markdown/rich text|
|author_id|uuid|FK ke `users.id`|
|status|enum(`draft`, `published`)||
|category|text|tutorial, tips, event, story|
|published_date|timestamptz|Nullable sampai di-publish|
|created_at|timestamptz||

### 4.12 `faq`

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|question|text||
|answer|text||
|order|int||

### 4.13 `community_settings`

Singleton table (selalu 1 row).

|Kolom|Tipe|Keterangan|
|---|---|---|
|id|uuid (PK)||
|name|text||
|description|text||
|keywords|text[]|Untuk SEO|
|light_logo_url|text||
|dark_logo_url|text||
|address|text||
|maps_location|text|Embed link/coordinate|

---

## 5. Auth Flow

1. User register/login via Supabase Auth (email/password atau OAuth GitHub).
2. Supabase Auth generate session (JWT), disimpan di cookie via `@supabase/ssr`.
3. Saat user pertama kali register, trigger Postgres (function + trigger di Supabase) otomatis insert row baru ke tabel `users` (sinkron `id`, `email`), default role `contributor`.
4. `middleware.ts` cek session di tiap request ke route group `(dashboard)` dan `(admin)`:
    - Belum login → redirect ke `/login`
    - Login tapi role bukan admin, akses `(admin)` → redirect/403
5. Row Level Security (RLS) di Supabase jadi lapis kedua: contoh, hanya `author_id = auth.uid()` yang boleh update post miliknya sendiri, hanya role `admin` yang boleh update `events`.

---

## 6. Data Fetching & Mutation Pattern

- **Read (list/detail halaman publik):** Server Component fetch langsung dari Supabase pakai server client → di-render sebagai HTML di server (SSR/SSG sesuai kebutuhan, misal artikel pakai ISR dengan revalidate).
- **Write (submit proyek, RSVP, dsb):** Server Actions dengan validasi Zod sebelum insert ke Supabase.
- **Realtime (opsional, v2):** Supabase Realtime kalau nanti butuh update live (misal jumlah RSVP live update tanpa refresh).

---

## 7. Image & File Handling

- Semua upload (avatar, image event, image proyek, file resource) masuk ke **Supabase Storage**, dikelompokkan per bucket:
    - `avatars/`
    - `events/`
    - `projects/`
    - `resources/`
- Next.js `next/image` dipakai untuk render, dengan `remotePatterns` di `next.config.js` diarahkan ke domain Supabase Storage.

---

## 8. Deployment

- Repo di GitHub → connect ke Vercel (auto-deploy tiap push ke `main`, preview deployment tiap PR).
- Environment variables (Supabase URL, anon key, service role key) diset di Vercel dashboard, terpisah untuk `production` dan `preview`.
- Migration Supabase dijalankan manual atau via CI (opsional v2) sebelum deploy kalau ada perubahan schema.

---

## 9. Open Items (perlu diputuskan sebelum coding)

- [ ] Drizzle ORM vs Prisma vs Supabase JS client langsung — final decision
- [ ] Konfirmasi: proyek & artikel perlu approval admin dulu? (nentuin default `status` di schema)
- [ ] Struktur `content` di `posts`/`projects` — markdown biasa atau rich text editor (misal Tiptap)?
