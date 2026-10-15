# BAGIAN 2: Sistem Desain "Soft Neo-Brutalism" (Cartoon & Rounded)

Agar visualnya bernuansa kartun yang ramah, modern, dan tidak berlebihan (tidak lebay), gunakan standar desain berikut:

## 1. Tipografi
- **Heading:** `Plus Jakarta Sans` atau `Fredoka` (`font-extrabold`, `tracking-tight`).
- **Body:** `Plus Jakarta Sans` atau `Inter` (`font-semibold` / `font-medium`).
- **Monospace (Room ID, Order ID, Timer):** `JetBrains Mono`.

## 2. Permukaan & Sudut (Rounded Cartoon)
- **Kontainer utama & modal:** `rounded-3xl` (`24px`).
- **Kartu & panel:** `rounded-2xl` (`16px`).
- **Tombol, badge, & input:** `rounded-xl` (`12px`).

## 3. Garis Tepi & Bayangan (Tactile & Subtle)
- **Border:** Selalu menggunakan `border-2 border-zinc-900` (`#18181B`).
- **Bayangan kartu:** `shadow-[4px_4px_0px_0px_#18181B]`.
- **Bayangan tombol & elemen kecil:** `shadow-[2px_2px_0px_0px_#18181B]` atau `shadow-[3px_3px_0px_0px_#18181B]`.
- **Efek klik tombol:** `transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`.

## 4. Palet Warna
- **Background Canvas:** Warm Cream `#FFFDF9`
- **Surface Card:** Pure White `#FFFFFF` & Soft Stone `#F5F5F4`
- **Primary Brand (Couple/LDR):** Pastel Rose `#FB7185` (`bg-rose-400`)
- **Secondary Accent (Premium/QRIS):** Warm Amber `#FCD34D` (`bg-amber-300`)
- **Interactive Studio Accent:** Soft Violet `#C4B5FD` (`bg-violet-300`)
- **Success / Paid:** Mint Emerald `#6EE7B7` (`bg-emerald-300`)