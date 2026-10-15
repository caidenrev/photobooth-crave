import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentGatewayServer } from "@/lib/paymentGatewayServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Parameter order_id wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Ambil data pembayaran dari database lokal
    const localPayment = db.findPaymentByOrderId(orderId);
    if (!localPayment) {
      return NextResponse.json(
        { success: false, error: "Pesanan pembayaran tidak ditemukan di database." },
        { status: 404 }
      );
    }

    // 2. Jika sudah tercatat 'paid' sebelumnya, langsung kembalikan status
    if (localPayment.status === "paid") {
      return NextResponse.json({
        success: true,
        order_id: localPayment.order_id,
        status: "paid",
        amount: localPayment.amount,
        paid_at: localPayment.paid_at,
        transaction_id: localPayment.transaction_id,
        is_freshly_activated: false,
      });
    }

    // 3. Panggil Payment Gateway untuk status terupdate
    let gatewayStatus;
    try {
      gatewayStatus = await paymentGatewayServer.getInvoice(
        localPayment.gateway_invoice_id
      );
    } catch (err: any) {
      // Jika gateway tidak bisa dihubungi, kembalikan pesan ramah tanpa menandai lunas atau gagal
      console.warn("Gateway status check unreachable:", err?.message);
      return NextResponse.json({
        success: true,
        order_id: localPayment.order_id,
        status: localPayment.status, // tetap pending
        is_gateway_offline: true,
        message: "Sedang mencoba menghubungi gateway pembayaran... Mohon tunggu.",
      });
    }

    // 4. Periksa apakah ada field "warning" (MERCHANT_DISCONNECTED atau SHOPEE_UNAVAILABLE)
    // Tagihan tetap pending, tampilkan "Sedang memeriksa pembayaran…" dan terus coba lagi. Jangan anggap gagal!
    const warning = gatewayStatus.warning;
    if (warning) {
      db.updateStatus(localPayment.order_id, "pending", warning);
      return NextResponse.json({
        success: true,
        order_id: localPayment.order_id,
        status: "pending",
        warning,
        is_checking: true,
        message: "Sedang memeriksa pembayaran...",
      });
    }

    // 5. Jika status gateway adalah 'paid':
    if (gatewayStatus.status === "paid") {
      // Tandai pesanan LUNAS HANYA SEKALI secara atomic (WHERE status = 'pending')
      const transitionResult = db.markAsPaidAtomic(
        localPayment.order_id,
        gatewayStatus.paid_at || new Date().toISOString(),
        gatewayStatus.transaction_id,
        gatewayStatus.payment_type
      );

      // Jalankan logika setelah bayar satu kali saja
      if (transitionResult.updated) {
        console.log(
          `[PAYMENT SUCCESS ACTIVATION] Order ${localPayment.order_id} lunas untuk Room ${localPayment.room_id}`
        );
      }

      return NextResponse.json({
        success: true,
        order_id: localPayment.order_id,
        status: "paid",
        amount: localPayment.amount,
        paid_at: transitionResult.record?.paid_at,
        transaction_id: transitionResult.record?.transaction_id,
        is_freshly_activated: transitionResult.updated,
      });
    }

    // 6. Jika status gateway adalah 'expired':
    if (gatewayStatus.status === "expired") {
      db.updateStatus(localPayment.order_id, "expired");
      return NextResponse.json({
        success: true,
        order_id: localPayment.order_id,
        status: "expired",
        message: "Waktu pembayaran QRIS telah kedaluwarsa.",
      });
    }

    // 7. Status masih 'pending' normal
    return NextResponse.json({
      success: true,
      order_id: localPayment.order_id,
      status: "pending",
      expires_at: gatewayStatus.expires_at || localPayment.expires_at,
    });
  } catch (error: any) {
    console.error("Check payment status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Terjadi kesalahan internal saat mengecek status.",
      },
      { status: 500 }
    );
  }
}
