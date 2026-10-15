# SnapBond SaaS - Antigravity Workspace Rules

## 1. Visual & Design System ("Soft Neo-Brutalism / Cartoon Rounded")
- **STRICT ZERO-EMOJI POLICY**: Never use any Unicode emojis anywhere in the codebase, UI text, buttons, toast messages, or empty states. Every visual indicator MUST use `lucide-react` icons with `strokeWidth={2.25}`.
- **Rounded Corners**: Never use sharp edges (`rounded-none`). Always use `rounded-3xl` for main containers/modals, `rounded-2xl` for cards, and `rounded-xl` for buttons, inputs, and badges.
- **Borders & Shadows (Not Overdone)**:
  - Use consistent `border-2 border-zinc-900` (`#18181b`).
  - Use subtle solid offset shadows: `shadow-[4px_4px_0px_0px_#18181b]` for cards and `shadow-[2px_2px_0px_0px_#18181b]` for buttons/badges.
  - All interactive buttons must have tactile press states: `transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`.
- **Color Palette**:
  - Background: `#FFFDF9` (Warm Cream)
  - Primary Accent (LDR/Couple): `bg-rose-400`
  - Premium/QRIS Accent: `bg-amber-300`
  - Studio/Admin Accent: `bg-violet-300`
  - Success/Paid Status: `bg-emerald-300`

## 2. Responsive Architecture
- Every page and component MUST be responsive across:
  - Mobile (`< 640px`): Touch-friendly bottom sheets/drawers, stacked or compact split dual-cam, bottom navigation bar.
  - Tablet (`640px - 1024px`): Adaptive 2-column grid.
  - Desktop (`> 1024px`): 12-column studio layout (8 cols stage, 4 cols live strip & checkout) and fixed left sidebar for Admin Dashboard.

## 3. Coding & Verification Standards
- Use Next.js (App Router), TypeScript (strict mode), Tailwind CSS, Zustand for state management, and `lucide-react`.
- Keep payment integration modular inside `src/services/paymentService.ts` so it connects cleanly to the existing QRIS payment backend via environment variables (`NEXT_PUBLIC_PAYMENT_API_URL`).
- Before completing any sprint task, run the dev server and verify both Mobile and Desktop viewports using the built-in browser tool.
