import { PageTransition } from "@/components/layout/PageTransition";

// Sidebar admin (layout) tetap diam; hanya konten halaman yang bertransisi
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
