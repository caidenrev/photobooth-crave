import fs from "fs";
import path from "path";
import { supabaseServer, isSupabaseServerConfigured } from "./supabaseServer";

export type PaymentStatus = "pending" | "paid" | "expired" | "failed";

export interface PaymentRecord {
  id: string;
  order_id: string;
  gateway_invoice_id: string;
  room_id: string;
  package_id: string;
  amount: number;
  status: PaymentStatus;
  qris_string: string;
  qris_image_base64?: string;
  expires_at: string;
  paid_at?: string;
  transaction_id?: string;
  payment_type?: string;
  warning_message?: string;
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  id: string;
  name: string;
  amount: number; // in Rupiah, positive integer
  description: string;
}

// Server-side authoritative packages price catalog
export const PACKAGES: Record<string, PackageItem> = {
  HD_WATERMARK_UNLOCK: {
    id: "HD_WATERMARK_UNLOCK",
    name: "Cetak HD 300 DPI + Hapus Watermark",
    amount: 15000,
    description: "Akses unduh resolusi tinggi bebas watermark untuk kedua pasangan LDR.",
  },
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "payments.json");

function ensureDbFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

function readAllPayments(): PaymentRecord[] {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw) as PaymentRecord[];
  } catch (err) {
    console.error("Failed to read payments db:", err);
    return [];
  }
}

function writeAllPayments(records: PaymentRecord[]): void {
  ensureDbFile();
  const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(records, null, 2), "utf8");
  fs.renameSync(tmpFile, DB_FILE);
}

// Safe async wrapper for fire-and-forget Supabase sync
async function safeSupabaseSync(task: () => Promise<any>): Promise<void> {
  if (!isSupabaseServerConfigured || !supabaseServer) return;
  try {
    const res = await task();
    if (res?.error) {
      console.warn("Supabase sync warning:", res.error.message);
    }
  } catch (err: any) {
    console.warn("Supabase sync error:", err?.message || err);
  }
}

export const db = {
  getPackage(packageId: string): PackageItem | null {
    return PACKAGES[packageId] || PACKAGES.HD_WATERMARK_UNLOCK;
  },

  findPaymentByOrderId(orderId: string): PaymentRecord | null {
    const records = readAllPayments();
    return records.find((p) => p.order_id === orderId) || null;
  },

  findPaymentByGatewayInvoiceId(invoiceId: string): PaymentRecord | null {
    const records = readAllPayments();
    return records.find((p) => p.gateway_invoice_id === invoiceId) || null;
  },

  insertPayment(payment: Omit<PaymentRecord, "id" | "created_at" | "updated_at">): PaymentRecord {
    const records = readAllPayments();
    const now = new Date().toISOString();
    const newRecord: PaymentRecord = {
      ...payment,
      id: "pay_" + Math.random().toString(36).substring(2, 10),
      created_at: now,
      updated_at: now,
    };
    records.push(newRecord);
    writeAllPayments(records);

    // Asynchronously sync to Supabase if configured
    safeSupabaseSync(async () => {
      if (!supabaseServer) return;
      return await supabaseServer.from("payments").insert({
        order_id: newRecord.order_id,
        gateway_invoice_id: newRecord.gateway_invoice_id,
        room_id: newRecord.room_id,
        package_id: newRecord.package_id,
        amount: newRecord.amount,
        status: newRecord.status,
        qris_string: newRecord.qris_string,
        qris_image_base64: newRecord.qris_image_base64,
        expires_at: newRecord.expires_at,
        created_at: newRecord.created_at,
        updated_at: newRecord.updated_at,
      });
    });

    return newRecord;
  },

  /**
   * Atomic update: Mark payment as paid ONLY if current status is 'pending'
   * Returns true if status transitioned from pending -> paid (exactly once)
   */
  markAsPaidAtomic(
    orderId: string,
    paidAt: string,
    transactionId?: string,
    paymentType?: string
  ): { updated: boolean; record: PaymentRecord | null } {
    const records = readAllPayments();
    const index = records.findIndex((p) => p.order_id === orderId);

    if (index === -1) {
      return { updated: false, record: null };
    }

    const current = records[index];
    if (current.status !== "pending") {
      // Already paid or expired, do not transition again
      return { updated: false, record: current };
    }

    // Perform atomic transition locally
    const now = new Date().toISOString();
    const updatedRecord: PaymentRecord = {
      ...current,
      status: "paid",
      paid_at: paidAt || now,
      transaction_id: transactionId || current.transaction_id,
      payment_type: paymentType || current.payment_type,
      updated_at: now,
    };

    records[index] = updatedRecord;
    writeAllPayments(records);

    // Sync atomic update to Supabase
    safeSupabaseSync(async () => {
      if (!supabaseServer) return;
      return await supabaseServer
        .from("payments")
        .update({
          status: "paid",
          paid_at: updatedRecord.paid_at,
          transaction_id: updatedRecord.transaction_id,
          payment_type: updatedRecord.payment_type,
          updated_at: now,
        })
        .eq("order_id", orderId)
        .eq("status", "pending");
    });

    return { updated: true, record: updatedRecord };
  },

  updateStatus(
    orderId: string,
    status: PaymentStatus,
    warningMessage?: string
  ): PaymentRecord | null {
    const records = readAllPayments();
    const index = records.findIndex((p) => p.order_id === orderId);

    if (index === -1) return null;

    const current = records[index];
    const now = new Date().toISOString();
    const updatedRecord: PaymentRecord = {
      ...current,
      status,
      warning_message: warningMessage ?? current.warning_message,
      updated_at: now,
    };

    records[index] = updatedRecord;
    writeAllPayments(records);

    // Sync status change to Supabase
    safeSupabaseSync(async () => {
      if (!supabaseServer) return;
      return await supabaseServer
        .from("payments")
        .update({
          status,
          warning_message: updatedRecord.warning_message,
          updated_at: now,
        })
        .eq("order_id", orderId);
    });

    return updatedRecord;
  },
};
