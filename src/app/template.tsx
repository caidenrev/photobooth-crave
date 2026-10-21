import { PageTransition } from "@/components/layout/PageTransition";

// template.tsx di-mount ulang setiap pindah route, sehingga enter/exit terpicu
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
