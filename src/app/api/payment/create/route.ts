import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentGatewayServer } from "@/lib/paymentGatewayServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = (body.room_id || "SOLO").toString().trim().toUpperCase();
    const packageId = body.package_id || "HD_WATERMARK_UNLOCK";
    const attempt = Number(body.attempt) || 1;
    const frameName =
      typeof body.frame_name === "string" ? body.frame_name.trim().slice(0, 60) : undefined;

    // 1. Authoritative price retrieval from server database
    const pkg = db.getPackage(packageId);
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "Paket foto tidak valid." },
        { status: 400 }
      );
    }

    const amount = pkg.amount;

    // 2. Strict integer validation on server: 1 s/d 100.000.000
    if (!Number.isInteger(amount) || amount < 1 || amount > 100_000_000) {
      return NextResponse.json(
        { success: false, error: "Nominal harga tidak valid." },
        { status: 400 }
      );
    }

    // 3. Generate unique order_id for this attempt
    const cleanRoom = roomId.replace(/[^A-Z0-9]/g, "");
    const baseCode = cleanRoom ? cleanRoom.substring(0, 8) : "SOLO";
    const timestamp = Date.now().toString().slice(-6);
    const orderId = `SB-${baseCode}-${timestamp}-${attempt}`;

    // 4. Call Crave Payment Gateway from Server
    let gatewayInvoice;
    try {
      gatewayInvoice = await paymentGatewayServer.createInvoice(
        orderId,
        amount,
        10 // 10 minutes expiry
      );
    } catch (err: any) {
      const errMsg = err?.message || "";
      if (errMsg.includes("MERCHANT_DISCONNECTED")) {
        return NextResponse.json(
          {
            success: false,
            code: "MERCHANT_DISCONNECTED",
            error: "Pembayaran QRIS sedang tidak tersedia. Mohon coba sesaat lagi.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: errMsg || "Gagal menghubungi payment gateway." },
        { status: 500 }
      );
    }

    // 5. Save payment record in local server database
    const record = db.insertPayment({
      order_id: gatewayInvoice.order_id || orderId,
      gateway_invoice_id: gatewayInvoice.id,
      room_id: roomId,
      package_id: packageId,
      amount,
      status: "pending",
      qris_string: gatewayInvoice.qris_string,
      qris_image_base64: gatewayInvoice.qris_image_base64,
      expires_at: gatewayInvoice.expires_at,
      frame_name: frameName,
    });

    // 6. Return payload to client (API Key never leaves server)
    return NextResponse.json({
      success: true,
      order_id: record.order_id,
      gateway_invoice_id: record.gateway_invoice_id,
      amount: record.amount,
      qris_string: record.qris_string,
      qris_image_base64: record.qris_image_base64,
      expires_at: record.expires_at,
      status: record.status,
    });
  } catch (error: any) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Terjadi kesalahan internal saat membuat pembayaran.",
      },
      { status: 500 }
    );
  }
}
