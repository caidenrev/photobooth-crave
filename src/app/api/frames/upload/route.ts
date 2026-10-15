import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { uploadFrameOverlay } from "@/lib/supabaseStorage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const frameId = (formData.get("frame_id") as string) || "custom";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File gambar frame tidak ditemukan." },
        { status: 400 }
      );
    }

    // Validasi tipe file harus PNG/WebP (format yang mendukung transparansi Canva)
    const mimeType = file.type;
    if (!["image/png", "image/webp", "image/svg+xml"].includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format file harus PNG transparan atau WebP agar foto terlihat melalui bingkai Canva.",
        },
        { status: 400 }
      );
    }

    // Batas ukuran 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal 10 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `canva_frame_${frameId}_${Date.now()}_${sanitizedName}`;

    // 1. Coba upload ke Supabase Storage jika sudah dikonfigurasi
    if (isSupabaseServerConfigured) {
      try {
        const storageRes = await uploadFrameOverlay(buffer, frameId, sanitizedName);
        if (storageRes.success && storageRes.publicUrl) {
          return NextResponse.json({
            success: true,
            url: storageRes.publicUrl,
            storage: "supabase",
            fileName,
          });
        }
      } catch (storageErr) {
        console.warn("Supabase upload failed, falling back to local public storage:", storageErr);
      }
    }

    // 2. Fallback: Simpan ke folder public lokal (public/uploads/frames/)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "frames");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/frames/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      storage: "local",
      fileName,
    });
  } catch (err: any) {
    console.error("Frame upload error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Terjadi kesalahan saat mengunggah frame.",
      },
      { status: 500 }
    );
  }
}
