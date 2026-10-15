# BAGIAN 1: Product Requirements Document (PRD)

Dokumen ini dirancang agar agen di Antigravity IDE dapat menyusun Implementation Plan Artifact, mengeksekusi kode secara modular, dan menguji tampilan langsung melalui built-in browser tanpa keluar dari konteks.

---

## 1. Ringkasan Produk (Product Overview)

- **Nama Proyek (Working Title):** SnapBond SaaS — Online LDR & Solo Photobooth
- **Model Bisnis:** Semi-Premium (Freemium + Pay-Per-Download/Frame via QRIS)
  - User dapat mencoba fitur kamera, berfoto bersama pasangan (LDR) atau sendiri (Solo), memilih frame, dan melihat preview secara gratis (dengan watermark).
  - Untuk mengunduh hasil foto resolusi penuh (HD) tanpa watermark, mendapatkan video boomerang/GIF sesi foto, atau memakai frame eksklusif, user melakukan pembayaran instan via QRIS yang terhubung ke service backend payment yang sudah tersedia.
- **Target Pengguna Utama:**
  1. **Pasangan LDR (Long Distance Relationship):** Ingin berfoto bersama secara real-time dari dua lokasi berbeda dalam satu photostrip yang menyatu.
  2. **Solo / Teman Satu Lokasi:** Pengguna yang ingin menikmati photobooth estetik dari smartphone, tablet, atau laptop.
  3. **Admin / Owner SaaS:** Mengelola katalog frame, memantau transaksi QRIS secara real-time, mengatur harga/promo, dan memantau room aktif.

---

## 2. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### A. Sisi Client (User & Pasangan LDR)
- **FR-C01 (Mode & Room Lobby):** User dapat memilih Mode Solo atau Mode Couple LDR. Pada Mode LDR, sistem membuat kode room unik (6 karakter, misal `LDR-892B`) beserta shareable link.
- **FR-C02 (Real-Time Dual Camera & Sync):** Menggunakan WebRTC / LiveKit / PeerJS untuk menampilkan video stream User A dan User B secara berdampingan. Tombol Capture menggunakan WebSocket/DataChannel agar countdown (`3.. 2.. 1..`) dan efek shutter flash berjalan serentak di kedua perangkat.
- **FR-C03 (High-Res Local Frame Capture):** Saat countdown habis, masing-masing browser menangkap gambar resolusi tinggi dari `<video>` lokal, lalu menyatukannya di dalam `<canvas>` utama agar hasil foto tidak buram akibat kompresi jaringan video.
- **FR-C04 (Multi-Pose & Retake):** Mendukung pengambilan 3 hingga 4 pose berurutan (beserta rekaman pendek untuk GIF/Boomerang otomatis) dengan fitur ulangi (retake) per pose.
- **FR-C05 (Live Collaborative Customizer):** Kedua user di dalam room dapat memilih layout strip (`1x3`, `1x4`, `2x2`), tema warna frame, filter kamera, dan stiker vektor secara sinkron.
- **FR-C06 (Watermark Engine & Paywall):** Selama status order belum `PAID`, seluruh pratinjau `<canvas>` menampilkan lapisan watermark yang ter-render di atas kanvas (bukan sekadar lapisan HTML di atas gambar agar tidak mudah dihapus lewat Inspect Element).
- **FR-C07 (Integrasi Checkout QRIS):** Menampilkan modal QRIS dinamis dari service backend payment lengkap dengan countdown waktu kedaluwarsa, cek status otomatis (polling / WebSocket / SSE), dan pembukaan kunci unduhan (Unlock HD) otomatis di kedua perangkat pasangan saat lunas.

### B. Sisi Dashboard Admin
- **FR-A01 (Executive Overview & Analytics):** Kartu metrik total pendapatan harian/bulanan, jumlah foto yang berhasil ditebus (conversion rate), total room LDR aktif, dan grafik tren transaksi.
- **FR-A02 (Manajemen & Monitoring Transaksi):** Tabel real-time log transaksi dari payment service (`PAID`, `PENDING`, `EXPIRED`, `FAILED`), pencarian berdasarkan Order ID atau Room Code, serta fitur manual unlock (jika ada kendala pembayaran pengguna) dan export CSV.
- **FR-A03 (CMS Frame & Aset Photobooth):** Fitur upload desain overlay frame (PNG transparan), penentuan koordinat/slot foto, pengaturan kategori (Free Watermarked vs Premium Paid), dan penetapan harga per frame.
- **FR-A04 (Manajemen Voucher & Harga Dasar):** Pengaturan harga tebus dasar (misal Rp10.000 - Rp15.000) dan pembuatan kode diskon/kupon.
- **FR-A05 (Live Room Monitor):** Memantau room WebRTC yang sedang aktif untuk mengawasi beban trafik server.

---

## 3. Kebutuhan Non-Fungsional & Arsitektur (Non-Functional Requirements)

- **NFR-01 (Zero-Emoji Policy):** Dilarang keras menggunakan karakter emoji Unicode di seluruh elemen UI, notifikasi, toast, maupun empty state. Wajib 100% menggunakan ikon vektor dari `lucide-react` dengan prop `strokeWidth={2.25}`.
- **NFR-02 (Cross-Device Responsiveness):**
  - **Mobile (< 640px):** Navigasi bawah (bottom bar), studio kamera stacked atau compact split, kontrol kustomisasi berbentuk bottom sheet/drawer.
  - **Tablet (640px - 1024px):** Tata letak 2 kolom adaptif dengan target sentuh (touch target) minimal 44x44px.
  - **Desktop (> 1024px):** Studio 12 kolom (8 kolom panggung kamera, 4 kolom panel live photostrip & kasir), Admin menggunakan fixed sidebar.
- **NFR-03 (Keamanan Aset Canvas):** Proses render foto resolusi tinggi tanpa watermark hanya dieksekusi setelah token validasi dari endpoint status pembayaran terverifikasi `PAID`.