# Panduan Lengkap Setup Supabase (Database, Auth, dan Storage) — SnapBond SaaS

Dokumen ini berisi panduan langkah demi langkah untuk mengonfigurasi backend **Supabase** untuk aplikasi SnapBond, mencakup Database PostgreSQL, Autentikasi Pengguna, dan Cloud Storage untuk template Canva serta file unduhan photostrip HD.

---

## 1. Ringkasan Arsitektur Supabase SnapBond

1. **Database Relasional**:
   - `public.profiles`: Profil pengguna dan role (`user` vs `admin`), terhubung otomatis dengan `auth.users`.
   - `public.payments`: Log transaksi pembayaran QRIS via payment gateway Crave.
   - `public.frames`: Katalog tema frame dan desain Canva kustom yang dikelola Admin.
   - `public.ldr_rooms`: Ruangan sesi foto real-time pasangan jarak jauh (LDR).
   - `public.photostrips`: Riwayat photostrip yang telah dicetak/disimpan.
2. **Supabase Auth**:
   - Registrasi/Login via Email & Password atau Magic Link.
   - Otomatis trigger pembuatan profil di tabel `public.profiles`.
3. **Supabase Storage**:
   - Bucket `photostrips`: Menyimpan file foto resolusi cetak HD 300 DPI dan pratinjau watermark.
   - Bucket `frame-overlays`: Menyimpan file PNG transparan desain Canva yang diunggah dari halaman Admin.

---

## 2. Langkah Demi Langkah Setup di Supabase

### Langkah 1: Buat Proyek Baru di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Klik tombol **New Project**.
3. Masukkan informasi proyek:
   - **Name**: `SnapBond-Photobooth` (atau nama pilihan Anda).
   - **Database Password**: Buat password yang kuat dan simpan dengan aman.
   - **Region**: Pilih **Singapore (ap-southeast-1)** atau region terdekat agar latensi rendah di Indonesia.
4. Klik **Create new project** dan tunggu 1-2 menit hingga status proyek siap (*Active*).

---

### Langkah 2: Eksekusi Skema SQL Otomatis
Semua tabel, relasi, storage bucket, trigger auth, dan seed data default sudah disiapkan di file `supabase_schema.sql`.

1. Di Dashboard Supabase, buka menu **SQL Editor** pada sidebar kiri (ikon `>_`).
2. Klik **New Query**.
3. Buka file [`supabase_schema.sql`](./supabase_schema.sql) di text editor / VS Code Anda, salin (**Copy**) seluruh isinya.
4. Tempel (**Paste**) ke dalam editor query Supabase.
5. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
6. Pastikan muncul pesan sukses: `Success. No rows returned`.

> Seluruh tabel (`payments`, `profiles`, `frames`, `ldr_rooms`, `photostrips`) beserta 2 bucket storage (`photostrips`, `frame-overlays`) kini telah terbuat secara otomatis.

---

### Langkah 3: Konfigurasi Supabase Auth

1. Buka menu **Authentication** di sidebar kiri -> klik **Providers**.
2. **Email Provider**:
   - Pastikan provider **Email** berstatus **Enabled**.
   - Untuk kemudahan pengujian lokal, Anda dapat menonaktifkan opsi *Confirm email* (Project Settings -> Authentication -> nonaktifkan *Enable email confirmations*).
3. **Google OAuth (Opsional)**:
   - Jika ingin login dengan Google, aktifkan provider Google dan masukkan Client ID & Client Secret dari Google Cloud Console.

---

### Langkah 4: Verifikasi Storage Buckets

1. Buka menu **Storage** di sidebar kiri.
2. Anda akan melihat 2 bucket publik yang sudah aktif:
   - `photostrips` (Public)
   - `frame-overlays` (Public)
3. Keduanya telah dipasangi kebijakan RLS (Row Level Security) sehingga klien dapat mengunduh foto dan admin dapat mengunggah file frame Canva.

---

### Langkah 5: Salin Kredensial ke `.env.local`

1. Di Dashboard Supabase, buka menu **Project Settings** (ikon gerigi di kiri bawah) -> klik **API**.
2. Salin nilai-nilai berikut:
   - **Project URL**: Salin URL proyek (contoh: `https://xyzcompany.supabase.co`).
   - **Project API Keys**:
     - `anon` / `public`: Salin kunci anon.
     - `service_role` / `secret`: Salin kunci service role (klik *Reveal* terlebih dahulu).
3. Buka file [`.env.local`](./.env.local) di proyek SnapBond Anda, lalu isi variabel berikut:

```env
# Payment Gateway Crave
PAYMENT_GATEWAY_URL=https://crave-payment-services-57oz.vercel.app
PAYMENT_GATEWAY_KEY=pgk_AQjopTgJfhY7Vhsv2m2V_Qma5QBK8Oss9niVvQbo3Q4

# Supabase Cloud Database & Storage Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Simpan file `.env.local`.

---

### Langkah 6: Cara Menjadikan Akun Anda sebagai Admin

Saat pertama kali mendaftar via Supabase Auth, akun Anda otomatis memiliki role `user`. Untuk mengubahnya menjadi `admin`:

1. Buka menu **Table Editor** di Supabase Dashboard.
2. Pilih tabel `public.profiles`.
3. Temukan baris email Anda, lalu ubah kolom `role` dari `'user'` menjadi `'admin'`.
4. Klik **Save**. Akun Anda kini memiliki hak akses penuh ke seluruh menu CMS Admin `/admin`.

---

### Langkah 7: Verifikasi Koneksi Otomatis

Untuk memastikan Supabase telah terhubung 100% dengan aplikasi Next.js:

1. Buka terminal di folder `d:\photobooth`.
2. Jalankan perintah:
   ```bash
   node scripts/verify_supabase.js
   ```
3. Jika berhasil, terminal akan menampilkan output:
   ```text
   === SNAPBONED SUPABASE HEALTH CHECK ===
   Menghubungkan ke: https://your-project-id.supabase.co...
   Koneksi Database Berhasil! Jumlah frames terdaftar: 8
   Buckets ditemukan: [ 'photostrips', 'frame-overlays' ]
   ```

---

## 3. Catatan Penting
- **Keamanan Kunci**: Kunci `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di sisi server ([src/lib/supabaseServer.ts](./src/lib/supabaseServer.ts)) dan **TIDAK PERNAH** dibagikan ke browser atau client.
- **High-Speed Fallback**: Jika variabel Supabase di `.env.local` belum diisi, SnapBond secara cerdas akan tetap berjalan normal menggunakan local storage fallback ([.data/payments.json](./.data/payments.json) dan folder `public/uploads/frames/`) sehingga Anda tidak akan mengalami kendala saat masa pengembangan.
