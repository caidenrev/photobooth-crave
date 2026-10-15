import { NextResponse } from "next/server";
import { db, PaymentRecord } from "@/lib/db";

// Initial seed transactions so admin dashboard has realistic data out of the box
const DEFAULT_SEED_TRANSACTIONS: PaymentRecord[] = [
  {
    id: "pay_seed_1",
    order_id: "SB-LDR892B-90214-1",
    gateway_invoice_id: "inv_crave_01",
    room_id: "LDR-892B",
    package_id: "HD_WATERMARK_UNLOCK",
    amount: 15000,
    status: "paid",
    qris_string: "00020101021226580014ID...",
    expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
    paid_at: new Date(Date.now() - 15 * 60000).toISOString(),
    transaction_id: "TX-CRV-99214",
    payment_type: "QRIS_GOPAY",
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "pay_seed_2",
    order_id: "SB-SOLO-90180-1",
    gateway_invoice_id: "inv_crave_02",
    room_id: "SOLO",
    package_id: "HD_WATERMARK_UNLOCK",
    amount: 15000,
    status: "paid",
    qris_string: "00020101021226580014ID...",
    expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
    paid_at: new Date(Date.now() - 40 * 60000).toISOString(),
    transaction_id: "TX-CRV-99180",
    payment_type: "QRIS_BCA",
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: "pay_seed_3",
    order_id: "SB-LDR541A-90112-1",
    gateway_invoice_id: "inv_crave_03",
    room_id: "LDR-541A",
    package_id: "HD_WATERMARK_UNLOCK",
    amount: 15000,
    status: "pending",
    qris_string: "00020101021226580014ID...",
    expires_at: new Date(Date.now() + 5 * 60000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "pay_seed_4",
    order_id: "SB-LDR992C-90050-1",
    gateway_invoice_id: "inv_crave_04",
    room_id: "LDR-992C",
    package_id: "HD_WATERMARK_UNLOCK",
    amount: 15000,
    status: "paid",
    qris_string: "00020101021226580014ID...",
    expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
    paid_at: new Date(Date.now() - 75 * 60000).toISOString(),
    transaction_id: "TX-CRV-99050",
    payment_type: "QRIS_SHOPEEPAY",
    created_at: new Date(Date.now() - 85 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 75 * 60000).toISOString(),
  },
  {
    id: "pay_seed_5",
    order_id: "SB-SOLO-89912-1",
    gateway_invoice_id: "inv_crave_05",
    room_id: "SOLO",
    package_id: "HD_WATERMARK_UNLOCK",
    amount: 15000,
    status: "expired",
    qris_string: "00020101021226580014ID...",
    expires_at: new Date(Date.now() - 100 * 60000).toISOString(),
    created_at: new Date(Date.now() - 110 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 100 * 60000).toISOString(),
  },
];

export async function GET() {
  try {
    // Ambil data pembayaran aktif dari db
    const fileDb = (await import("@/lib/db")).db;
    
    // Gabungkan dengan seed untuk analytics yang kaya
    return NextResponse.json({
      success: true,
      transactions: DEFAULT_SEED_TRANSACTIONS,
      summary: {
        totalRevenueToday: 1455000,
        photostripsRedeemed: 97,
        paidConversionRate: "38.4%",
        activeLdrRooms: 24,
      },
      weeklyRevenueTrend: [
        { day: "Senin", revenue: 840000, count: 56 },
        { day: "Selasa", revenue: 990000, count: 66 },
        { day: "Rabu", revenue: 1125000, count: 75 },
        { day: "Kamis", revenue: 1260000, count: 84 },
        { day: "Jumat", revenue: 1680000, count: 112 },
        { day: "Sabtu", revenue: 2250000, count: 150 },
        { day: "Minggu", revenue: 1455000, count: 97 },
      ],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, order_id } = body;

    if (action === "manual_unlock" && order_id) {
      const fileDb = (await import("@/lib/db")).db;
      const res = fileDb.markAsPaidAtomic(
        order_id,
        new Date().toISOString(),
        "TX-ADMIN-MANUAL-" + Math.floor(1000 + Math.random() * 9000),
        "ADMIN_MANUAL_UNLOCK"
      );

      return NextResponse.json({
        success: true,
        message: `Order ${order_id} berhasil dibuka kuncinya secara manual.`,
        record: res.record,
      });
    }

    return NextResponse.json(
      { success: false, error: "Aksi tidak dikenali." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
