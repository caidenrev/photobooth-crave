## BAGIAN 3: Agile Roadmap & Product Backlog (5 Sprint)

Pengembangan dibagi menjadi 5 Phase (Sprint) agar terstruktur dan dapat diuji di setiap akhir fase:

---

## Sprint 1: Foundation, Soft Neo-Brutalism UI Kit & App Shell

| ID | Backlog Item | Deskripsi Teknis | Prioritas | Definition of Done (DoD) |
| :--- | :--- | :--- | :---: | :--- |
| **PB-101** | Setup Proyek & Token Desain | Setup Next.js (App Router) + TypeScript + Tailwind CSS + `lucide-react` + Zustand. | High | Konfigurasi tema warna, shadow brutalism halus, dan font berjalan tanpa error. |
| **PB-102** | Komponen UI Dasar (Design System) | Buat komponen `BrutalButton`, `BrutalCard`, `BrutalBadge`, `BrutalModal`, `BrutalInput`, `BrutalTabs`. | High | Semua komponen memiliki sudut `rounded-xl/2xl`, `border-2`, efek klik, dan bebas emoji. |
| **PB-103** | Responsive Layout Shell | Buat Landing Page, Layout Client Studio, dan Layout Admin Dashboard (Sidebar di Desktop, Bottom Nav di Mobile). | High | Lolos uji responsif di viewport 375px (Mobile), 768px (Tablet), dan 1440px (Desktop). |

---

## Sprint 2: Core Photobooth Engine (Solo Mode & HTML5 Canvas)

| ID | Backlog Item | Deskripsi Teknis | Prioritas | Definition of Done (DoD) |
| :--- | :--- | :--- | :---: | :--- |
| **PB-201** | Modul Kamera & Media Stream | Akses `getUserMedia`, pilih perangkat kamera, fitur mirror/flip, dan penanganan izin kamera ditolak. | High | Kamera tampil mulus dengan rasio aspek terkunci (4:3 atau 1:1) di mobile & desktop. |
| **PB-202** | Sesi Multi-Pose & Countdown | Timer hitung mundur (3, 2, 1), efek shutter flash, penyimpanan array foto (3-4 pose), dan fitur retake per slot. | High | User dapat mengambil 3-4 pose berurutan dan mengulang pose tertentu. |
| **PB-203** | Canvas Compositor & Watermark | Penggabungan pose ke dalam template frame PNG di `<canvas>`, pemilihan filter, dan render watermark otomatis. | High | Preview photostrip ter-render tajam dengan watermark terkunci sebelum pembayaran. |

---

## Sprint 3: LDR Couple Room & Real-Time Dual Camera Sync

| ID | Backlog Item | Deskripsi Teknis | Prioritas | Definition of Done (DoD) |
| :--- | :--- | :--- | :---: | :--- |
| **PB-301** | Room Generator & Lobby LDR | Buat/gabung room dengan kode 6 karakter atau invite URL, indikator status koneksi pasangan. | High | Dua browser berbeda dapat masuk ke room yang sama dan melihat status Connected. |
| **PB-302** | WebRTC Dual-Stream & Sync Shutter | Tampilkan kamera lokal & pasangan berdampingan. Sinkronisasi klik tombol Foto Bersama via WebSocket/DataChannel. | High | Klik tombol foto di Browser A memicu countdown serentak di Browser A & B. |
| **PB-303** | Dual-Canvas Frame Merger | Menggabungkan tangkapan layar resolusi tinggi dari kamera A dan kamera B ke dalam satu slot frame bersebelahan. | High | Hasil foto pasangan LDR menyatu rapi di setiap baris photostrip tanpa pecah. |

---

## Sprint 4: Integrasi Payment Backend QRIS & Unlock Flow

| ID | Backlog Item | Deskripsi Teknis | Prioritas | Definition of Done (DoD) |
| :--- | :--- | :--- | :---: | :--- |
| **PB-401** | Service Adapter Payment Backend | Buat API client/adapter untuk memanggil endpoint `createTransaction` dan `checkStatus` milik backend payment yang sudah ada. | High | Aplikasi dapat mengirim payload order dan menerima string/URL QRIS beserta `orderId`. |
| **PB-402** | Modal Kasir QRIS & Realtime Listener | Tampilkan QRIS, nominal, countdown timer, dan polling/SSE status transaksi setiap 3 detik. | High | Saat status berubah menjadi `PAID`, modal menutup otomatis dan menampilkan animasi sukses. |
| **PB-403** | Dual-Unlock & High-Res Exporter | Hapus watermark dari `<canvas>` untuk kedua pasangan di room yang sama dan buka tombol unduh PNG HD + Boomerang GIF. | High | Kedua pasangan LDR dapat langsung mengunduh file HD bersih setelah salah satu membayar. |

---

## Sprint 5: Admin Dashboard, CMS Frame & Analytics

| ID | Backlog Item | Deskripsi Teknis | Prioritas | Definition of Done (DoD) |
| :--- | :--- | :--- | :---: | :--- |
| **PB-501** | Dashboard Metrik & Grafik | Halaman ringkasan pendapatan QRIS, rasio konversi tebus foto, dan jumlah room aktif. | Medium | Kartu statistik dan grafik tampil responsif di desktop maupun mobile. |
| **PB-502** | Tabel Monitoring Transaksi QRIS | Tabel dengan filter status (`PAID`, `PENDING`, `EXPIRED`), pencarian Order ID, export CSV, dan tombol Manual Override Unlock. | High | Admin dapat memantau transaksi masuk dan melakukan unlock manual jika dibutuhkan. |
| **PB-503** | Frame CMS & Pricing Manager | Form unggah frame PNG transparan, pratinjau penempatan slot foto, serta pengaturan status Gratis/Premium dan harga. | High | Frame yang diunggah admin langsung muncul di daftar pilihan frame halaman Client. |