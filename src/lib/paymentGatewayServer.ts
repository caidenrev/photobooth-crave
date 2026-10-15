export interface GatewayInvoiceCreateResponse {
  id: string;
  order_id: string;
  amount: number;
  status: "pending" | "paid" | "expired";
  qris_string: string;
  qris_image_base64?: string;
  created_at: string;
  expires_at: string;
}

export interface GatewayInvoiceStatusResponse {
  id: string;
  order_id: string;
  amount: number;
  status: "pending" | "paid" | "expired";
  expires_at: string;
  paid_at?: string;
  transaction_id?: string;
  payment_type?: string;
  warning?: string; // MERCHANT_DISCONNECTED or SHOPEE_UNAVAILABLE
}

export interface GatewayErrorResponse {
  success: false;
  code: string;
  error: string;
}

class PaymentGatewayServer {
  private get baseUrl(): string {
    return (
      process.env.PAYMENT_GATEWAY_URL ||
      "https://crave-payment-services-57oz.vercel.app"
    );
  }

  private get apiKey(): string {
    const key = process.env.PAYMENT_GATEWAY_KEY;
    if (!key) {
      throw new Error("PAYMENT_GATEWAY_KEY server environment variable is not set.");
    }
    return key;
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * 1) Buat tagihan ke gateway:
   * POST {PAYMENT_GATEWAY_URL}/api/v2/invoices
   */
  public async createInvoice(
    orderId: string,
    amount: number,
    expiresInMinutes: number = 10
  ): Promise<GatewayInvoiceCreateResponse> {
    const url = `${this.baseUrl}/api/v2/invoices`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        order_id: orderId,
        amount,
        expires_in_minutes: expiresInMinutes,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok && res.status !== 200 && res.status !== 201) {
      const err = data as GatewayErrorResponse;
      throw new Error(err.error || `Gateway error with code ${err.code || res.status}`);
    }

    return data as GatewayInvoiceCreateResponse;
  }

  /**
   * 2) Cek status invoice:
   * GET {PAYMENT_GATEWAY_URL}/api/v2/invoices/{id}
   */
  public async getInvoice(id: string): Promise<GatewayInvoiceStatusResponse> {
    const url = `${this.baseUrl}/api/v2/invoices/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      const err = data as GatewayErrorResponse;
      throw new Error(err.error || `Gateway status error: ${err.code || res.status}`);
    }

    return data as GatewayInvoiceStatusResponse;
  }

  /**
   * 3) Status merchant:
   * GET {PAYMENT_GATEWAY_URL}/api/v2/merchant
   */
  public async getMerchantStatus(): Promise<any> {
    const url = `${this.baseUrl}/api/v2/merchant`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      cache: "no-store",
    });

    return await res.json();
  }
}

export const paymentGatewayServer = new PaymentGatewayServer();
