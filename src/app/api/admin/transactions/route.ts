import { NextResponse, connection } from "next/server";
import { db, PaymentRecord } from "@/lib/db";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Seed transactions so admin dashboard has realistic data out of the box.
// Waktu dihitung relatif terhadap `now` agar selalu tampak segar.
// Record asli di database (order_id sama) selalu menimpa seed.
function buildSeedTransactions(now: number): PaymentRecord[] {
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();
  return [
    {
      id: "pay_seed_1",
      order_id: "SB-LDR892B-90214-1",
      gateway_invoice_id: "inv_crave_01",
      room_id: "LDR-892B",
      package_id: "HD_WATERMARK_UNLOCK",
      amount: 15000,
      status: "paid",
      qris_string: "00020101021226580014ID...",
      expires_at: iso(10 * MINUTE),
      paid_at: iso(-10 * MINUTE),
      transaction_id: "TX-CRV-99214",
      payment_type: "QRIS_GOPAY",
      frame_name: "Pastel Rose",
      created_at: iso(-20 * MINUTE),
      updated_at: iso(-10 * MINUTE),
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
      expires_at: iso(10 * MINUTE),
      paid_at: iso(-24 * MINUTE),
      transaction_id: "TX-CRV-99180",
      payment_type: "QRIS_BCA",
      frame_name: "Warm Cream",
      created_at: iso(-30 * MINUTE),
      updated_at: iso(-24 * MINUTE),
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
      expires_at: iso(5 * MINUTE),
      frame_name: "Dark Noir",
      created_at: iso(-45 * MINUTE),
      updated_at: iso(-45 * MINUTE),
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
      expires_at: iso(10 * MINUTE),
      paid_at: iso(-60 * MINUTE),
      transaction_id: "TX-CRV-99050",
      payment_type: "QRIS_SHOPEEPAY",
      frame_name: "Soft Violet",
      created_at: iso(-70 * MINUTE),
      updated_at: iso(-60 * MINUTE),
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
      expires_at: iso(-110 * MINUTE),
      frame_name: "Warm Amber",
      created_at: iso(-120 * MINUTE),
      updated_at: iso(-110 * MINUTE),
    },
    {
      id: "pay_seed_6",
      order_id: "SB-LDR104X-89800-1",
      gateway_invoice_id: "inv_crave_06",
      room_id: "LDR-104X",
      package_id: "HD_WATERMARK_UNLOCK",
      amount: 15000,
      status: "paid",
      qris_string: "00020101021226580014ID...",
      expires_at: iso(10 * MINUTE),
      paid_at: iso(-3 * HOUR),
      transaction_id: "TX-CRV-89800",
      payment_type: "QRIS_DANA",
      frame_name: "Mint Emerald",
      created_at: iso(-3 * HOUR - 10 * MINUTE),
      updated_at: iso(-3 * HOUR),
    },
  ];
}

// Ringkas record untuk klien (tanpa QRIS string/gambar base64 yang besar)
function toAdminTransaction(record: PaymentRecord, now: number) {
  const isLapsed =
    record.status === "pending" && new Date(record.expires_at).getTime() < now;
  return {
    order_id: record.order_id,
    room_id: record.room_id,
    mode: /^SOLO/i.test(record.room_id) ? ("Solo" as const) : ("LDR" as const),
    frame_name: record.frame_name || "—",
    amount: record.amount,
    status: isLapsed ? ("expired" as const) : record.status,
    payment_type: record.payment_type,
    created_at: record.created_at,
    paid_at: record.paid_at,
    updated_at: record.updated_at,
  };
}

function getAllRecords(now: number): PaymentRecord[] {
  const fileRecords = db.listPayments();
  const known = new Set(fileRecords.map((r) => r.order_id));
  return [
    ...fileRecords,
    ...buildSeedTransactions(now).filter((s) => !known.has(s.order_id)),
  ];
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function GET() {
  await connection();
  try {
    const now = Date.now();
    const transactions = getAllRecords(now)
      .map((r) => toAdminTransaction(r, now))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    const paid = transactions.filter((t) => t.status === "paid" && t.paid_at);
    const todayStart = startOfDay(now);
    const yesterdayStart = todayStart - 24 * HOUR;
    const paidAt = (t: (typeof paid)[number]) => new Date(t.paid_at!).getTime();

    const paidToday = paid.filter((t) => paidAt(t) >= todayStart);
    const paidYesterday = paid.filter(
      (t) => paidAt(t) >= yesterdayStart && paidAt(t) < todayStart
    );
    const revenueToday = paidToday.reduce((sum, t) => sum + t.amount, 0);
    const revenueYesterday = paidYesterday.reduce((sum, t) => sum + t.amount, 0);
    const hoursElapsed = Math.max(1, (now - todayStart) / HOUR);

    const activeLdrRooms = new Set(
      transactions
        .filter(
          (t) =>
            t.mode === "LDR" && now - new Date(t.updated_at).getTime() <= 2 * HOUR
        )
        .map((t) => t.room_id)
    ).size;

    const weeklyRevenueTrend = Array.from({ length: 7 }, (_, i) => {
      const dayStart = todayStart - (6 - i) * 24 * HOUR;
      const dayEnd = dayStart + 24 * HOUR;
      const dayPaid = paid.filter((t) => paidAt(t) >= dayStart && paidAt(t) < dayEnd);
      return {
        day: DAY_LABELS[new Date(dayStart).getDay()],
        date: new Date(dayStart).toISOString(),
        revenue: dayPaid.reduce((sum, t) => sum + t.amount, 0),
        count: dayPaid.length,
      };
    });

    return NextResponse.json(
      {
        success: true,
        serverTime: new Date(now).toISOString(),
        transactions,
        summary: {
          totalRevenueToday: revenueToday,
          revenueGrowthPct:
            revenueYesterday > 0
              ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100
              : null,
          photostripsRedeemed: paidToday.length,
          avgPerHour: paidToday.length / hoursElapsed,
          paidCount: paid.length,
          totalSessions: transactions.length,
          paidConversionRate:
            transactions.length > 0 ? (paid.length / transactions.length) * 100 : 0,
          pendingCount: transactions.filter((t) => t.status === "pending").length,
          activeLdrRooms,
        },
        weeklyRevenueTrend,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
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
      // Seed belum ada di database: simpan dulu agar status lunas bertahan
      if (!db.findPaymentByOrderId(order_id)) {
        const seed = buildSeedTransactions(Date.now()).find(
          (s) => s.order_id === order_id
        );
        if (!seed) {
          return NextResponse.json(
            { success: false, error: `Order ${order_id} tidak ditemukan.` },
            { status: 404 }
          );
        }
        // insertPayment membuat id & timestamp baru untuk record ini
        db.insertPayment(seed);
      }

      const res = db.markAsPaidAtomic(
        order_id,
        new Date().toISOString(),
        "TX-ADMIN-MANUAL-" + Math.floor(1000 + Math.random() * 9000),
        "ADMIN_MANUAL_UNLOCK"
      );

      if (!res.updated) {
        return NextResponse.json(
          {
            success: false,
            error: `Order ${order_id} tidak bisa dibuka: status saat ini "${res.record?.status ?? "tidak diketahui"}".`,
            record: res.record,
          },
          { status: 409 }
        );
      }

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
