# BAGIAN 4: Setup & Prompt Development untuk Antigravity IDE

Di Antigravity IDE, agen bekerja paling optimal jika kamu memasang **Workspace Rules** terlebih dahulu (pada file `.agents/rules/snapbond-rules.md` atau melalui menu *Customizations > Rules* di pojok kanan atas Antigravity IDE) lalu mengeksekusi pembangunan menggunakan **Prompt per Sprint** di bawah ini satu per satu. Tunggu hingga agen selesai memverifikasi satu sprint sebelum lanjut ke sprint berikutnya.

---

## Prompt Sprint 1: Setup Foundation, Design System & App Shell

```text
Kita akan membangun proyek serius "SnapBond" — Online Photobooth SaaS khusus pasangan LDR dan Solo dengan skema Semi-Premium (bayar via QRIS untuk buka watermark/download HD) serta Dashboard Admin.

Ikuti aturan di `.agents/rules/snapbond-rules.md` (Soft Neo-Brutalism dengan sudut rounded, tidak lebay, 100% menggunakan `lucide-react` dan DILARANG menggunakan emoji sama sekali).

Untuk SPRINT 1 ini, buat Implementation Plan terlebih dahulu lalu kerjakan backlog berikut:
1. [PB-101] Setup proyek Next.js (App Router) + TypeScript + Tailwind CSS + `lucide-react` + Zustand. Konfigurasikan palet warna Warm Cream (`#FFFDF9`), utility shadow neo-brutalism halus, dan font Plus Jakarta Sans.
2. [PB-102] Bangun reusable UI Component Library di `src/components/ui/`:
  - `BrutalButton` (variants: primary rose, amber premium, violet, emerald, neutral; lengkap dengan efek tekan tactile).
  - `BrutalCard`, `BrutalBadge`, `BrutalModal`, `BrutalInput`, dan `BrutalTabs`.
3. [PB-103] Bangun App Shell & Navigasi Responsif (Mobile, Tablet, Desktop):
  - `/` (Landing page dengan pilihan "Mulai Solo Photobooth" atau "Buat/Gabung Room LDR").
  - `/studio` (Kerangka halaman Client Photobooth: 8 kolom studio kamera + 4 kolom live preview di desktop, dan tampilan adaptif di mobile).
  - `/admin` (Kerangka Dashboard Admin dengan navigasi Sidebar di desktop dan Bottom Bar di mobile).

Setelah selesai, jalankan dev server dan verifikasi tampilan `/` , `/studio`, dan `/admin` pada layar Desktop dan Mobile menggunakan browser untuk memastikan tidak ada emoji dan desain Soft Neo-Brutalism sudah presisi.
```

---

## Prompt Sprint 2: Core Photobooth Engine & Canvas Watermark

```text
Lanjut ke SPRINT 2: Membangun Core Photobooth Engine & HTML5 Canvas Compositor pada `/studio`.

Buat Implementation Plan dan kerjakan backlog berikut:
1. [PB-201] Buat modul kamera (`src/components/studio/CameraStage.tsx`) menggunakan `navigator.mediaDevices.getUserMedia` dengan fitur pilih kamera (device selector), tombol Mirror/Flip horizontal, pilihan filter warna (Normal, Warm Retro, B&W, Soft Pastel), dan tampilan fallback rapi jika izin kamera belum diberikan.
2. [PB-202] Buat state & kontrol sesi foto (`src/store/useStudioStore.ts`):
  - Pilihan layout strip (`1x3` vertikal, `1x4` vertikal, `2x2` grid).
  - Sistem Countdown (`3, 2, 1`) dengan animasi shutter flash.
  - Penyimpanan hasil tangkapan tiap pose ke dalam array, lengkap dengan tombol "Ulangi Pose (Retake)" per slot foto.
3. [PB-203] Buat HTML5 Canvas Photostrip Compositor (`src/components/studio/PhotostripPreview.tsx`):
  - Menggabungkan foto-foto yang sudah diambil ke dalam satu kanvas photostrip beserta pilihan warna/tema frame dan stiker vektor berbasis ikon.
  - Render lapisan Watermark diagonal ("SNAPBOND PREVIEW") langsung di dalam gambar `<canvas>` selama status transaksi masih `UNPAID`.

Jalankan verifikasi di browser untuk memastikan alur ambil 3 pose, ganti warna frame, dan render watermark di `<canvas>` berjalan lancar di mobile dan desktop.
```

---

## Prompt Sprint 3: LDR Couple Room & Dual-Camera Sync

```text
Lanjut ke SPRINT 3: Membangun Fitur Utama Pasangan LDR (Dual-Camera Room & Synchronized Shutter).

Buat Implementation Plan dan kerjakan backlog berikut:
1. [PB-301] Buat sistem Room LDR (`src/components/studio/LdrRoomBar.tsx` & room signaling service):
  - User dapat membuat Room LDR baru (generate kode unik 6 karakter, misal `LDR-892B`) atau bergabung menggunakan kode/link.
  - Tampilkan status koneksi pasangan (`Menunggu Pasangan`, `Terhubung`, `Sinyal Stabil`) dan tombol salin tautan undangan.
2. [PB-302] Implementasikan Dual-Stream Camera Stage untuk Mode LDR:
  - Tampilkan video stream User A (Lokal) dan User B (Pasangan/Remote) secara berdampingan di dalam panggung kamera (mendukung Simulasi/Mock Partner Stream untuk pengujian lokal 1 perangkat sekaligus arsitektur WebRTC/PeerJS untuk 2 perangkat).
  - Sinkronisasikan tombol "Foto Bersama (Sync)": saat ditekan oleh salah satu user, countdown 3-2-1 berjalan serentak.
3. [PB-303] Update Canvas Compositor agar pada Mode LDR, setiap baris pose di photostrip menggabungkan tangkapan kamera User A (kiri) dan User B (kanan) secara rapi dan proporsional.

Uji di browser baik pada ukuran layar Mobile maupun Desktop.
```

---

## Prompt Sprint 4: Integrasi Payment Backend QRIS & Unlock HD

```text
Lanjut ke SPRINT 4: Integrasi Service Backend Payment QRIS & Alur Tebus Foto (Semi-Premium).

Buat Implementation Plan dan kerjakan backlog berikut:
1. [PB-401] Buat modular API Service di `src/services/paymentService.ts`:
  - Sediakan fungsi `createQrisTransaction(payload: { roomId: string; frameId: string; amount: number })` dan `getTransactionStatus(orderId: string)` yang siap dihubungkan ke endpoint backend payment milikku melalui environment variable `NEXT_PUBLIC_PAYMENT_API_URL` (sertakan juga mode fallback mock/sandbox agar bisa diuji end-to-end saat development).
2. [PB-402] Bangun `QrisCheckoutModal.tsx`:
  - Muncul saat user menekan tombol "Tebus Foto HD via QRIS".
  - Menampilkan kode QRIS dari backend, Order ID, rincian harga frame, dan countdown timer batas waktu pembayaran.
  - Lakukan polling/listener otomatis untuk mengecek status pembayaran.
3. [PB-403] Implementasikan fitur Auto-Unlock & High-Res Download:
  - Begitu status pembayaran berubah menjadi `PAID`, otomatis buka kunci (`isPaid = true`) untuk kedua pasangan di dalam room LDR tersebut.
  - Render ulang `<canvas>` tanpa watermark dalam resolusi tinggi (HD) dan aktifkan tombol "Unduh Photostrip PNG (HD)".

Verifikasi alur checkout QRIS hingga unduh file PNG tanpa watermark menggunakan browser.
```

---

## Prompt Sprint 5: Admin Dashboard (Monitoring Transaksi & Frame CMS)

```text
Lanjut ke SPRINT 5: Membangun Dashboard Admin Lengkap di `/admin`.

Buat Implementation Plan dan kerjakan backlog berikut:
1. [PB-501] Halaman Overview & Analytics (`/admin`):
  - Kartu ringkasan metrik bergaya Soft Neo-Brutalism: Total Pendapatan QRIS Hari Ini, Jumlah Photostrip Ditebus, Rasio Konversi Paid, dan Jumlah Room LDR Aktif.
  - Grafik visual tren pendapatan mingguan/bulanan.
2. [PB-502] Halaman Monitoring Transaksi QRIS (`/admin/transactions`):
  - Tabel responsif (otomatis menjadi card list di mobile) yang menampilkan Order ID, Kode Room, Frame, Nominal, Status (`PAID`, `PENDING`, `EXPIRED`), dan Waktu.
  - Fitur filter status, pencarian Order ID/Room, tombol Export CSV, serta tombol aksi "Manual Unlock" jika admin ingin membuka kunci foto pelanggan secara manual.
3. [PB-503] Halaman CMS Manajemen Frame & Harga (`/admin/frames`):
  - Daftar katalog frame beserta form tambah/edit frame (nama frame, warna/upload overlay PNG transparan, tipe Gratis vs Premium, dan harga dalam Rupiah).
  - Hubungkan state/data katalog frame ini agar perubahan harga atau penambahan frame di Admin langsung tercermin di halaman `/studio` Client.

Jalankan pemeriksaan menyeluruh di browser untuk memastikan seluruh fitur Client dan Admin terhubung, responsif di Mobile/Tablet/Desktop, dan 100% mematuhi aturan desain.
```

---

## Tips Tambahan Saat Menjalankan di Antigravity IDE
- **Koneksi ke Backend Payment Kamu:** Pada Sprint 4, kamu cukup memberikan contoh response JSON dari endpoint pembuatan QRIS dan webhook/check-status backend milikmu ke agen Antigravity agar `src/services/paymentService.ts` langsung disesuaikan 1:1 dengan struktur payload API kamu.
- **Review Implementation Plan Artifact:** Setiap kali kamu mengirim prompt Sprint di atas, periksa dulu Implementation Plan yang diajukan agen sebelum mengizinkannya menulis kode agar struktur filenya tetap bersih.