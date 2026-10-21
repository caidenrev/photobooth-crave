// Urutan halaman mengikuti urutan menu navigasi (kiri → kanan, atas → bawah).
// Pindah ke halaman dengan urutan lebih besar = maju (slide ke kiri),
// lebih kecil = kembali (slide ke kanan).
const ROUTE_ORDER = [
  "/",
  "/studio",
  "/history",
  "/login",
  "/admin",
  "/admin/transactions",
  "/admin/frames",
  "/admin/rooms",
  "/admin/settings",
];

function routeIndex(path: string): number {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  let best = -1;
  let bestLen = -1;
  ROUTE_ORDER.forEach((route, i) => {
    const matches = route === "/" ? clean === "/" : clean === route || clean.startsWith(route + "/");
    if (matches && route.length > bestLen) {
      best = i;
      bestLen = route.length;
    }
  });
  return best;
}

export type NavTransitionType = "nav-forward" | "nav-back";

/** Tipe transisi untuk <Link transitionTypes> / router.push berdasarkan arah navigasi */
export function getNavTransitionTypes(from: string, to: string): NavTransitionType[] {
  const fromIdx = routeIndex(from);
  const toIdx = routeIndex(to);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return [];
  return [toIdx > fromIdx ? "nav-forward" : "nav-back"];
}
