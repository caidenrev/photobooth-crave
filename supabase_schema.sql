-- ==============================================================================
-- SnapBond SaaS Database & Storage Schema for Supabase
-- Run this complete script inside Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE: payments
-- Menyimpan seluruh transaksi pembayaran QRIS melalui payment gateway
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,                          -- ID pesanan unik (cth: SB-LDR892B-90214-1)
  gateway_invoice_id TEXT NOT NULL,                      -- ID tagihan dari gateway Crave
  room_id TEXT NOT NULL DEFAULT 'SOLO',                  -- Kode Room LDR atau 'SOLO'
  package_id TEXT NOT NULL DEFAULT 'HD_WATERMARK_UNLOCK', -- ID paket foto
  amount INTEGER NOT NULL CHECK (amount >= 1 AND amount <= 100000000), -- Nominal Rupiah
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'failed')),
  qris_string TEXT NOT NULL,                             -- Payload string QRIS nasional
  qris_image_base64 TEXT,                                -- Gambar QR base64 jika ada
  expires_at TIMESTAMPTZ NOT NULL,                       -- Batas kedaluwarsa (10 menit)
  paid_at TIMESTAMPTZ,                                   -- Waktu sukses dibayar
  transaction_id TEXT,                                   -- ID transaksi dari gateway
  payment_type TEXT,                                     -- Metode bayar (cth: QRIS_BCA, QRIS_GOPAY)
  warning_message TEXT,                                  -- Pesan warning gateway jika ada
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_room_id ON public.payments(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- ==============================================================================
-- 3. TABLE: frames
-- Katalog tema frame photostrip dinamis yang dikelola via Admin CMS (/admin/frames)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.frames (
  id TEXT PRIMARY KEY,                                   -- Slug unik (cth: 'cream', 'rose', 'sunset-gold')
  name TEXT NOT NULL,                                    -- Nama tampilan frame
  bg_hex TEXT NOT NULL DEFAULT '#FFFDF9',                -- Warna latar frame
  text_hex TEXT NOT NULL DEFAULT '#18181B',              -- Warna judul/teks utama
  border_hex TEXT NOT NULL DEFAULT '#18181B',            -- Warna garis tepi neo-brutalist
  subtext_hex TEXT NOT NULL DEFAULT '#52525B',           -- Warna subteks/tanggal
  is_premium BOOLEAN NOT NULL DEFAULT true,              -- Gratis vs Semi-Premium
  price INTEGER NOT NULL DEFAULT 15000,                  -- Harga tebusan cetak HD
  description TEXT,                                      -- Deskripsi tema
  is_active BOOLEAN NOT NULL DEFAULT true,               -- Ditampilkan di /studio atau tidak
  overlay_url TEXT,                                      -- URL file PNG overlay transparan dari storage
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. TABLE: ldr_rooms
-- Ruangan sesi foto real-time pasangan jarak jauh (LDR)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ldr_rooms (
  room_id TEXT PRIMARY KEY,                              -- Kode Room 6-8 karakter (cth: 'LDR-892B')
  host_id TEXT NOT NULL,                                 -- ID User Pembuat Room
  partner_id TEXT,                                       -- ID User Pasangan yang bergabung
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'connected', 'in_session', 'finished')),
  is_paid BOOLEAN NOT NULL DEFAULT false,                -- Status tebus foto HD
  active_layout TEXT NOT NULL DEFAULT '1x4',             -- '1x3' | '1x4' | '2x2'
  active_frame_id TEXT NOT NULL DEFAULT 'cream' REFERENCES public.frames(id) ON UPDATE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ldr_rooms_status ON public.ldr_rooms(status);

-- ==============================================================================
-- 5. TABLE: photostrips
-- Hasil foto cetak photostrip yang tersimpan di cloud storage
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.photostrips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,                                 -- Terhubung ke room LDR atau SOLO
  layout TEXT NOT NULL DEFAULT '1x4',
  frame_id TEXT NOT NULL DEFAULT 'cream',
  hd_image_url TEXT,                                     -- URL file PNG resolusi HD 300 DPI (bebas watermark)
  preview_image_url TEXT,                                -- URL file PNG pratinjau dengan watermark
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_photostrips_room_id ON public.photostrips(room_id);

-- ==============================================================================
-- 6. SUPABASE STORAGE BUCKETS
-- Membuat bucket untuk menyimpan file foto photostrip dan overlay frame kustom
-- ==============================================================================

-- Buat bucket 'photostrips' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('photostrips', 'photostrips', true)
ON CONFLICT (id) DO NOTHING;

-- Buat bucket 'frame-overlays' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('frame-overlays', 'frame-overlays', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. STORAGE POLICIES (RLS)
-- Akses publik untuk membaca hasil foto & overlay, serta upload untuk anon/user
-- ==============================================================================
DO $$
BEGIN
  -- Kebijakan bucket photostrips
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Photostrips' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Access Photostrips" ON storage.objects
      FOR SELECT USING (bucket_id = 'photostrips');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow Upload Photostrips' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Allow Upload Photostrips" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'photostrips');
  END IF;

  -- Kebijakan bucket frame-overlays
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Frame Overlays' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Access Frame Overlays" ON storage.objects
      FOR SELECT USING (bucket_id = 'frame-overlays');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow Upload Frame Overlays' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Allow Upload Frame Overlays" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'frame-overlays');
  END IF;
END $$;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) UNTUK TABEL
-- ==============================================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ldr_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photostrips ENABLE ROW LEVEL SECURITY;

-- Kebijakan Publik untuk Membaca Frame (Client Studio)
CREATE POLICY "Allow public read frames" ON public.frames
  FOR SELECT USING (true);

-- Kebijakan Admin untuk Mengelola Frame
CREATE POLICY "Allow all for frames" ON public.frames
  FOR ALL USING (true);

-- Kebijakan Publik untuk Payments (dikelola aman via Server API route)
CREATE POLICY "Allow all for payments" ON public.payments
  FOR ALL USING (true);

-- Kebijakan Publik untuk LDR Rooms
CREATE POLICY "Allow all for ldr_rooms" ON public.ldr_rooms
  FOR ALL USING (true);

-- Kebijakan Publik untuk Photostrips
CREATE POLICY "Allow all for photostrips" ON public.photostrips
  FOR ALL USING (true);

-- ==============================================================================
-- 9. SEED DATA DEFAULT (FRAME TEMA SIGNATURE)
-- ==============================================================================
INSERT INTO public.frames (id, name, bg_hex, text_hex, border_hex, subtext_hex, is_premium, price, description, is_active)
VALUES
  ('cream', 'Warm Cream', '#FFFDF9', '#18181B', '#18181B', '#52525B', false, 0, 'Tema signature SnapBond dengan nuansa hangat dan lembut.', true),
  ('rose', 'Pastel Rose', '#FECDD3', '#18181B', '#18181B', '#4C0519', true, 15000, 'Aksen merah muda manis untuk momen romantis pasangan LDR.', true),
  ('amber', 'Warm Amber', '#FDE68A', '#18181B', '#18181B', '#78350F', true, 15000, 'Warna kuning ceria bernuansa retro 90-an.', true),
  ('violet', 'Soft Violet', '#DDD6FE', '#18181B', '#18181B', '#4C1D95', true, 15000, 'Warna ungu pastel modern yang estetik untuk photostrip.', true),
  ('emerald', 'Mint Emerald', '#A7F3D0', '#18181B', '#18181B', '#064E3B', true, 15000, 'Warna hijau mint segar dan menenangkan.', true),
  ('noir', 'Dark Noir', '#18181B', '#FFFFFF', '#18181B', '#A1A1AA', true, 15000, 'Gaya monokrom gelap elegan dan misterius.', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bg_hex = EXCLUDED.bg_hex,
  text_hex = EXCLUDED.text_hex,
  border_hex = EXCLUDED.border_hex,
  subtext_hex = EXCLUDED.subtext_hex,
  is_premium = EXCLUDED.is_premium,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Selesai! Skema Supabase SnapBond siap digunakan.
