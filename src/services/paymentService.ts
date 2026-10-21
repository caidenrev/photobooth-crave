import { ldrSignalingService } from "./ldrSignalingService";

export type PaymentStatus = "pending" | "paid" | "expired" | "failed";

export interface CreatePaymentPayload {
  roomId: string;
  packageId?: string;
  attempt?: number;
  frameName?: string;
}

export interface ClientPaymentResponse {
  success: boolean;
  order_id: string;
  gateway_invoice_id: string;
  amount: number;
  qris_string: string;
  qris_image_base64?: string;
  expires_at: string;
  status: PaymentStatus;
  error?: string;
  code?: string;
}

export interface ClientPaymentStatusResponse {
  success: boolean;
  order_id: string;
  status: PaymentStatus;
  amount?: number;
  paid_at?: string;
  transaction_id?: string;
  warning?: string;
  is_checking?: boolean;
  is_gateway_offline?: boolean;
  message?: string;
  expires_at?: string;
  error?: string;
}

class PaymentService {
  /**
   * Panggil API Route Server untuk membuat tagihan QRIS ke Payment Gateway
   */
  public async createPayment(
    payload: CreatePaymentPayload
  ): Promise<ClientPaymentResponse> {
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id: payload.roomId || "SOLO",
        package_id: payload.packageId || "HD_WATERMARK_UNLOCK",
        attempt: payload.attempt || 1,
        frame_name: payload.frameName,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Gagal membuat tagihan pembayaran QRIS.");
    }

    return data as ClientPaymentResponse;
  }

  /**
   * Panggil API Route Server untuk memeriksa status tagihan QRIS
   */
  public async checkStatus(
    orderId: string
  ): Promise<ClientPaymentStatusResponse> {
    const res = await fetch(
      `/api/payment/status?order_id=${encodeURIComponent(orderId)}`
    );
    const data = await res.json();

    if (!res.ok && !data.success) {
      throw new Error(data.error || "Gagal memeriksa status pembayaran.");
    }

    return data as ClientPaymentStatusResponse;
  }

  /**
   * Memicu pesan room LDR agar pasangan langsung terbuka kuncinya secara otomatis
   */
  public broadcastPaymentSuccess(orderId: string, roomId: string): void {
    if (roomId && roomId !== "SOLO") {
      ldrSignalingService.broadcastMessage("PAYMENT_SUCCESS", {
        orderId,
        roomId,
      });
    }
  }
}

export const paymentService = new PaymentService();
