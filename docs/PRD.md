# PRD - Mataram Dev

**Product Requirements Document** **Versi:** 0.1 **Status:** Draft **Terakhir diupdate:** 18 September 2026

---

## 1. Overview

### 1.1 Latar Belakang

Mataram Dev adalah platform komunitas developer & designer di Kota Mataram, NTB. Website ini menjadi wadah utama untuk:

- Menghimpun talenta digital lokal (developer, designer, product manager)
- Menyelenggarakan event, workshop, dan sharing session
- Menampilkan proyek/karya anggota komunitas
- Menyediakan resource belajar gratis
- Membangun forum diskusi dan Q&A antar anggota

### 1.2 Tujuan Produk

1. Menjadi pusat informasi resmi komunitas Mataram Dev (event, kursus, proyek).
2. Memfasilitasi anggota untuk berkontribusi (menulis artikel, submit proyek, ikut diskusi).
3. Meningkatkan engagement komunitas melalui RSVP event, kontribusi konten, dan showcase karya.
4. Menjadi portofolio kolektif — menunjukkan aktivitas & dampak komunitas ke pihak luar (calon partner, sponsor, media).

### 1.3 Target Pengguna

|Role|Deskripsi|
|---|---|
|**Guest / Visitor**|Pengunjung umum, belum login. Bisa lihat event, artikel, proyek, resource.|
|**Contributor**|Anggota terdaftar. Bisa RSVP event, submit proyek, tulis artikel, ikut forum.|
|**Admin**|Pengurus komunitas. Kelola konten (event, artikel, FAQ, resource), moderasi user & proyek.|

---

## 2. Problem Statement

Saat ini aktivitas komunitas tersebar di berbagai platform (WhatsApp, Instagram, Discord, spreadsheet manual) sehingga:

- Info event/kegiatan sulit ditemukan dan gampang tenggelam.
- Tidak ada showcase terpusat untuk karya/proyek anggota.
- Sulit melacak siapa saja kontributor aktif dan histori kontribusinya.
- Onboarding member baru tidak terstruktur.

Website ini menjawab masalah tersebut dengan menyediakan satu platform terpusat, terstruktur, dan mudah diakses publik.

---

## 3. Scope

### 3.1 In Scope (v1)

- Landing page (hero, stats, event terbaru, aktivitas komunitas, featured projects, resource gratis, artikel, FAQ)
- Autentikasi (register/login, role-based: admin & contributor)
- Manajemen Event (list, detail, status upcoming/ongoing/completed, RSVP)
- Manajemen Proyek/Showcase (submit, list, detail, kontributor & stack)
- Free Resources (list & download resource: cheatsheet, template, dsb)
- Blog/Artikel (list, detail, kategori/tag)
- FAQ
- Halaman profil anggota (bio, sosial media, proyek & artikel terkait)
- Community settings (pengaturan umum: nama, logo, kontak, sosial media) — dikelola admin
- Dark/Light mode
- Multi-bahasa (ID sebagai default, tanda "ID" di nav mengindikasikan ada rencana i18n)

### 3.2 Out of Scope (v1 — kandidat v2)

- Forum diskusi/Q&A penuh (thread, reply, upvote) — v1 cukup link keluar (Discord/Telegram)
- Sistem notifikasi in-app
- Payment/donasi
- Sertifikat digital untuk peserta kursus/event
- Analytics dashboard mendalam untuk admin

---

## 4. Functional Requirements

### 4.1 Autentikasi & User Management

- User bisa register & login (email/password, dan/atau OAuth GitHub sebagai nilai tambah untuk audiens developer)
- User memiliki role: `admin`, `contributor`
- User bisa edit profil: fullname, username, image, bio, social media links
- Admin bisa manage user (ubah role, nonaktifkan akun)

### 4.2 Event

- Publik bisa melihat list event (dengan filter status: upcoming, ongoing, completed)
- Detail event menampilkan: title, deskripsi lengkap, waktu mulai/selesai, lokasi, poster
- Contributor bisa RSVP ke event upcoming
- Admin bisa CRUD event

### 4.3 Proyek / Showcase

- Contributor bisa submit proyek: nama, deskripsi, gambar, stack, github url, demo url, kontributor lain
- Publik bisa browse & lihat detail proyek
- Admin bisa moderasi (approve/reject) proyek sebelum tayang di featured

### 4.4 Free Resources

- Admin upload resource (file + icon + kategori)
- Publik bisa browse & download resource

### 4.5 Artikel / Blog

- Contributor (atau role tertentu) bisa menulis artikel (draft/publish)
- Publik bisa baca artikel, difilter berdasarkan kategori/tag
- Admin bisa moderasi sebelum publish

### 4.6 FAQ

- Admin CRUD FAQ, dengan urutan tampil yang bisa diatur

### 4.7 Community Settings

- Admin atur informasi umum komunitas (nama, deskripsi, keyword SEO, logo light/dark, alamat, lokasi maps, social media)

---

## 5. Non-Functional Requirements

|Kategori|Requirement|
|---|---|
|**Performa**|Landing page & halaman publik harus fast-loading (target Lighthouse Performance score >90), memanfaatkan SSR/SSG/ISR sesuai kebutuhan halaman|
|**Deployment**|Harus mudah di-deploy dan di-maintain di Vercel|
|**Skalabilitas**|Struktur database harus mendukung pertumbuhan jumlah anggota, event, dan proyek tanpa refactor besar|
|**Keamanan**|Password tidak disimpan manual (delegasikan ke auth provider), role-based access control untuk aksi admin|
|**Aksesibilitas**|Kontras warna cukup di light & dark mode, navigasi keyboard-friendly|
|**SEO**|Halaman publik (event, artikel, proyek) harus SEO-friendly (meta tag, slug URL, OG image)|
|**Responsif**|Mobile-first, karena target audiens banyak akses dari HP|

---

## 6. Tech Stack (ringkasan keputusan)

> Detail lengkap ada di `ARCHITECTURE.md`

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database + Storage + Auth:** Supabase (Postgres, Storage, Auth)
- **Hosting:** Vercel

---

## 7. Data Model (ringkasan)

> Detail skema lengkap & relasi ada di `ARCHITECTURE.md` / `schema.sql` / `prisma.schema`

Entitas utama: `Users`, `Events`, `Event_RSVP`, `Activities`, `Projects`, `Project_Contributors`, `Stacks`, `Free_Resources`, `Posts`, `FAQ`, `Community_Settings`, `Social_Links`.

---

## 8. Success Metrics

- Jumlah anggota terdaftar bertambah dari waktu ke waktu
- Jumlah RSVP per event
- Jumlah proyek yang di-submit oleh anggota
- Jumlah artikel yang dipublish oleh kontributor
- Waktu load halaman utama (Core Web Vitals)

---

## 9. Open Questions

- [ ] Apakah butuh OAuth GitHub untuk login, atau email/password saja cukup untuk v1?
- [ ] Apakah proyek & artikel butuh approval admin sebelum tayang publik, atau langsung publish?
- [ ] Apakah forum/Q&A akan dibangun sendiri di v2, atau tetap redirect ke Discord/Telegram selamanya?
- [ ] Apakah butuh sistem tagging/kategori terpisah untuk artikel vs event?

---

## 10. Referensi

- Desain: Figma (landing page, mega menu Komunitas/Kursus/Lainnya, dark & light mode)
- Design guide: `design-guide.md` (bento grid, Space Grotesk/Inter/JetBrains Mono)
