import { supabaseServer, isSupabaseServerConfigured } from "./supabaseServer";

export interface StorageUploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
  path?: string;
}

/**
 * Upload photostrip PNG (baik HD maupun Preview watermark) ke Supabase Storage bucket 'photostrips'
 */
export async function uploadPhotostrip(
  dataUrlOrBuffer: string | Buffer,
  fileName: string,
  contentType: string = "image/png"
): Promise<StorageUploadResult> {
  if (!isSupabaseServerConfigured || !supabaseServer) {
    return {
      success: false,
      error: "Supabase belum dikonfigurasi di environment variables.",
    };
  }

  try {
    let fileBody: Buffer;

    if (typeof dataUrlOrBuffer === "string") {
      // Decode base64 data URL
      const base64Data = dataUrlOrBuffer.replace(/^data:image\/\w+;base64,/, "");
      fileBody = Buffer.from(base64Data, "base64");
    } else {
      fileBody = dataUrlOrBuffer;
    }

    const filePath = `strips/${Date.now()}_${fileName}`;

    const { data, error } = await supabaseServer.storage
      .from("photostrips")
      .upload(filePath, fileBody, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabaseServer.storage
      .from("photostrips")
      .getPublicUrl(data.path);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error("Storage error:", err);
    return { success: false, error: err?.message || "Internal upload error" };
  }
}

/**
 * Upload overlay PNG kustom frame ke Supabase Storage bucket 'frame-overlays'
 */
export async function uploadFrameOverlay(
  fileBuffer: Buffer,
  frameId: string,
  fileName: string
): Promise<StorageUploadResult> {
  if (!isSupabaseServerConfigured || !supabaseServer) {
    return {
      success: false,
      error: "Supabase belum dikonfigurasi di environment variables.",
    };
  }

  try {
    const filePath = `overlays/${frameId}_${Date.now()}_${fileName}`;

    const { data, error } = await supabaseServer.storage
      .from("frame-overlays")
      .upload(filePath, fileBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabaseServer.storage
      .from("frame-overlays")
      .getPublicUrl(data.path);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Overlay upload error" };
  }
}
