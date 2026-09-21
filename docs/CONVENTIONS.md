# CONVENTIONS.md - Mataram Dev

**Versi:** 0.1 **Status:** Draft **Terakhir diupdate:** 18 September 2026 **Referensi:** `PRD.md`, `ARCHITECTURE.md`

> Dokumen ini jadi acuan konsistensi kode, baik untuk manusia maupun AI coding agent (OpenCode, ZCode, dsb) yang bantu develop project ini. Simpan juga ringkasannya di file instruksi agent (misal `CLAUDE.md`/`.cursorrules`) biar konsisten ke-load tiap sesi.

---

## 1. Bahasa & Penamaan

### 1.1 Bahasa

- **Kode (variable, function, komponen, tabel DB):** Bahasa Inggris.
- **Konten yang tampil ke user (UI text, label, pesan error):** Bahasa Indonesia (sesuai target audiens).
- **Komentar kode:** Boleh campur, tapi utamakan Inggris untuk hal teknis, Indonesia untuk catatan bisnis logic yang butuh konteks lokal.

### 1.2 Penamaan File & Folder

|Jenis|Konvensi|Contoh|
|---|---|---|
|Komponen React|PascalCase|`EventCard.tsx`, `MegaMenu.tsx`|
|Halaman (App Router)|lowercase, sesuai konvensi Next.js|`page.tsx`, `layout.tsx`|
|Utility/helper|camelCase|`formatDate.ts`, `slugify.ts`|
|Server actions|camelCase, verb-first|`createEvent.ts`, `submitProject.ts`|
|Folder|kebab-case|`free-resources/`, `event-rsvp/`|
|Tabel DB|snake_case, plural|`events`, `project_contributors`|
|Kolom DB|snake_case|`image_url`, `created_at`|

### 1.3 Penamaan Variabel & Fungsi

- Variable & fungsi: `camelCase`
- Komponen: `PascalCase`
- Konstanta global/config: `UPPER_SNAKE_CASE` (misal `MAX_UPLOAD_SIZE`)
- Boolean: prefix `is`, `has`, `should` → `isPublished`, `hasRsvp`, `shouldRedirect`
- Type/Interface: `PascalCase`, tanpa prefix `I` → `Event`, `UserProfile` (bukan `IEvent`)
- Enum: `PascalCase` untuk nama, `UPPER_SNAKE_CASE` atau lowercase konsisten untuk value (ikuti Postgres enum value, biasanya lowercase: `'upcoming'`, `'published'`)

---

## 2. Struktur Komponen

- Satu file = satu komponen utama.
- Komponen kecil yang hanya dipakai di satu tempat boleh ditaruh dalam file yang sama (co-location), tapi kalau dipakai >1 tempat, pindah ke `components/`.
- Urutan di dalam file komponen:
    1. Import (eksternal dulu, baru internal, baru types)
    2. Type/interface props
    3. Komponen
    4. Sub-komponen kecil (kalau ada, di bawah)
- Default export untuk komponen utama per file, named export untuk utility.

```tsx
// components/sections/EventCard.tsx
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  // ...
}
```

---

## 3. Server Components vs Client Components

- **Default: Server Component.** Hanya tambahkan `"use client"` kalau komponen butuh:
    - State (`useState`, `useReducer`)
    - Effect (`useEffect`)
    - Event handler interaktif (`onClick`, `onChange`, dsb)
    - Browser-only API
- Client Component sebaiknya "island" kecil — jangan jadikan seluruh halaman client component hanya karena ada satu tombol interaktif. Pecah jadi komponen kecil.
- Data fetching selalu di Server Component atau Server Action, **jangan** fetch data di `useEffect`.

---

## 4. Server Actions

- Ditaruh di `lib/actions/`, dikelompokkan per domain: `lib/actions/events.ts`, `lib/actions/projects.ts`, dsb.
- Selalu validasi input pakai Zod di awal function, sebelum query ke Supabase.
- Selalu return shape yang konsisten, misal:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

- Cek otorisasi (role, ownership) di awal Server Action — jangan andalkan UI guard doang.

---

## 5. Database & Query

- Nama tabel: plural, snake_case (`events`, bukan `event` atau `Events`).
- Setiap tabel wajib punya `id` (uuid), `created_at`. Tambahkan `updated_at` kalau data bisa diedit.
- Foreign key: `<nama_tabel_singular>_id` → `user_id`, `event_id`.
- Query kompleks (join banyak tabel) sebaiknya dibuat sebagai reusable function di `lib/queries/`, jangan diulang-ulang inline di tiap page.
- Row Level Security (RLS) **wajib aktif** di semua tabel yang punya data sensitif/milik user (posts, projects, users). Jangan matiin RLS demi kemudahan development.

---

## 6. Styling (Tailwind)

- Ikuti design token dari `design-guide.md` (Space Grotesk untuk heading, Inter untuk body, JetBrains Mono untuk code/monospace).
- Hindari inline arbitrary value (`w-[137px]`) kecuali benar-benar perlu — utamakan skala Tailwind default atau extend di `tailwind.config.ts`.
- Class order: gunakan Prettier plugin `prettier-plugin-tailwindcss` biar urutan class konsisten otomatis, gak perlu mikir manual.
- Dark mode: pakai strategy `class` (`dark:`), bukan `media`, biar toggle manual (sesuai tombol dark/light di nav) bisa kontrol penuh.
- Komponen berulang (card, badge, button) sebaiknya diabstraksi ke `components/ui/` daripada copy-paste class Tailwind panjang di banyak tempat.

---

## 7. TypeScript

- `strict: true` di `tsconfig.json` — wajib.
- Hindari `any`. Kalau terpaksa (misal data dari third-party tanpa types), pakai `unknown` + narrowing, atau minimal kasih komentar alasan.
- Shared types ditaruh di `types/index.ts` atau per-domain (`types/event.ts`, `types/project.ts`) kalau makin banyak.
- Tipe hasil query Supabase sebaiknya di-generate otomatis (`supabase gen types typescript`) untuk sinkron dengan schema database, bukan ditulis manual dan gampang out-of-sync.

---

## 8. Git Workflow

### 8.1 Branch Naming

```
feature/<nama-fitur>       → feature/event-rsvp
fix/<nama-bug>             → fix/mega-menu-dark-mode
chore/<deskripsi>          → chore/update-dependencies
docs/<deskripsi>           → docs/update-architecture
```

### 8.2 Commit Message (Conventional Commits)

```
<type>(<scope opsional>): <deskripsi singkat>
```

Type yang dipakai: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`

Contoh:

```
feat(events): add RSVP functionality for upcoming events
fix(auth): resolve session not persisting after OAuth login
docs(architecture): update database schema for project_stacks
```

### 8.3 Pull Request

- Tiap PR idealnya scope-nya kecil & fokus satu fitur/fix.
- Judul PR ikut format commit message.
- Deskripsi PR minimal: apa yang berubah, kenapa, cara testing (kalau relevan).

---

## 9. Environment Variables

- Semua secret/config di `.env.local` (jangan pernah commit ke git — pastikan `.gitignore` sudah benar).
- Sediakan `.env.example` dengan key yang dibutuhkan tapi value kosong/dummy, biar kontributor lain gampang setup.
- Prefix `NEXT_PUBLIC_` **hanya** untuk variable yang memang aman diekspos ke browser (misal Supabase URL & anon key). Service role key **jangan pernah** pakai prefix ini.

---

## 10. Panduan Khusus untuk AI Coding Agent

- Sebelum generate kode baru, agent harus baca `PRD.md`, `ARCHITECTURE.md`, dan file ini (`CONVENTIONS.md`) sebagai konteks utama.
- Kalau ada instruksi yang bertentangan antara permintaan sesaat vs dokumen ini, agent perlu tanya konfirmasi dulu, bukan asumsi sendiri.
- Saat generate komponen baru, agent wajib ikutin struktur folder di `ARCHITECTURE.md` § 3 — jangan taruh file sembarang tempat.
- Saat generate query/mutation baru, agent wajib sertakan validasi Zod dan cek otorisasi, sesuai § 4 & § 5 di atas.
- Kalau agent ragu soal keputusan yang belum final (lihat bagian "Open Items" di `PRD.md`/`ARCHITECTURE.md`), agent harus flag ke user, bukan pilih sendiri diam-diam.

---

## 11. Open Items

- [ ] Finalisasi ORM (Drizzle/Prisma) — akan menentukan detail konvensi query di § 5
- [ ] Konfirmasi apakah pakai testing framework (Vitest/Playwright) — belum dibahas, perlu ditambahkan section testing kalau iya
