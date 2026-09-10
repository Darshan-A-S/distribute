# distribute — Design System

> A dark, data-tool aesthetic. Slate-950 canvas, a single teal-green accent used everywhere without apology, Inter for product UI, and the whole thing shown as product-first mockups rather than abstract illustration.

**Theme:** dark (slate-950)

distribute reads like an engineering tool at midnight: a near-black indigo canvas (`#020617`), hairline white borders at 6–8% opacity, and one teal family that carries every signal from the primary button to the pulsing "in queue" dot. The interface floats — cards, menu bars, dashboard mockups — on the dark canvas with a single inset top highlight and a low drop shadow. Typography is Inter for everything, with **Stack Sans Notch** reserved for the hero display line. Hierarchy comes from weight and size, not color: text is a cool slate ramp and teal is reserved for actions and live state.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Canvas | `#020617` | `--color-canvas` (slate-950) | Page background; every surface sits on it |
| Card surface | `#ffffff` at 3% | `card` bg | Any floating panel, mockup, or form card |
| Hairline | `#ffffff` at 8% | borders / `border-white/[0.08]` | Card borders, dividers, inputs — the structural line color |
| Primary Green | `#57aa43` | `teal-500` | Primary buttons, active nav, key highlights, progress fills |
| Highlight | `#81c14b` | `teal-400` | Button hover, progress gradients, focus rings, live dots |
| Deep Green | `#2e933c` | `teal-600` | Gradient ends, active button states |
| Dark Ink | `#0e2527` | `teal-950` | Text/icon on teal buttons (dark-on-bright) |
| Primary text | `#f1f5f9` | `text-slate-100` | Headings, labels, primary copy |
| Muted text | `#94a3b8` | `text-slate-400` | Secondary copy, metadata, helper text |
| Faint text | `#64748b` | `text-slate-500` | Captions, placeholders, footnotes |
| Danger | `red-500` | `btn-danger` | Destructive actions (delete templates, recipients, users) |

## Tokens — Typography

### Inter — Product type

Loaded from Google Fonts (weights 300–700). Applied globally via `font-sans`. Used for all app UI, buttons, nav, body, tables.

- **Weights:** 300, 400, 500, 600, 700
- **Tracking:** tight on headings (`tracking-tight`), normal on body
- **Role:** everything except the hero display line

### Stack Sans Notch — Display type (200–700 variable)

Loaded from Google Fonts, applied only via the `.font-stack` class. Used for the landing hero headline ("Personalized certificates, at scale.") to give the wordmark a distinctive editorial voice at large sizes.

## Components (index.css utility classes)

| Class | Usage |
|-------|-------|
| `.card` | `bg-white/[0.03] border border-white/[0.08] rounded-xl` + inset top highlight and soft black shadow. Every floating surface. |
| `.btn-primary` | Teal-500 fill, `text-slate-50`, rounded-lg, teal glow shadow; hover → `teal-400`/`teal-950` text; focus ring teal. |
| `.btn-secondary` | White 10% border, 5% fill, slate-200 text. Quiet counterpart to primary. |
| `.btn-danger` | `red-500` at 10% fill, red-300 text. Destructive actions. |
| `.input` | Full-width, `bg-slate-950/70`, white/10 border, teal focus ring. |
| `.label` | `text-sm` slate-400, `mb-1.5`. |
| `.icon-btn` | Icon-only ghost button, hover white 6% fill. |
| `.badge` | Monospace 10px chip, white/10 border. Used for keys, meta. |
| `.page-title` | `text-2xl font-bold tracking-tight text-slate-50`. |

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas | `#020617` | Page background with two fixed radial green glows |
| 1 | Card | white 3% on canvas | Cards, mockups, forms |
| 2 | Hover | white 6–10% | Icon buttons, nav hover, secondary buttons |
| 3 | Accent fill | `#57aa43` | Primary buttons, active states, progress bars |

Depth is expressed with a hairline border + a 1px inset top highlight + a soft black drop shadow on cards. No big elevation stacks.

## Layout

- **Public pages:** landing (`/`), docs (`/docs`), login, reset-password.
- **App shell:** fixed left sidebar (logo + nav + profile) with content right. Routes `/app`, `/app/recipients`, `/app/send`, `/app/settings`, `/app/admin/users`.
- **Max-width:** `max-w-6xl` (1152px) for public headers and content; app content uses `max-w-4xl`.
- **Radius scale:** `rounded-xl` (12px) cards, `rounded-lg` (8px) buttons/inputs/icon buttons, `rounded-full` pills/chips/dots.

## Components of Interest

### Sidebar (app shell)
Icon + label nav, active item gets `bg-teal-500/10 text-teal-300`, icon on the left of every link. Logo mark 32px (`h-8 w-8`), wordmark "distribute" at `text-sm`. Profile block pinned to the bottom with an avatar (gradient teal circle, initials).

### Login / Reset brand lockup
The transparent logo mark alone at 48px (`h-12 w-12`), no colored box around it, centered above the card.

### Landing hero
Eyebrow pill (teal 10% fill) → **Stack Sans Notch** headline with "certificates" in `teal-500` → one-line slate-400 description → two CTAs (primary fill + secondary ghost). Below, a **bento grid**: a full-height app mockup (2×2, min-h-[400px]) with sidebar, stat chips, an active send row and a pinned Templates strip, plus three right-side cards — a "Sending" progress card, a certificate data card, and a "Send queue" list card.

### Footer brand row
Logo (24px) + wordmark (12px) + a pulsing teal dot (`animate-pulse` with a teal glow shadow) separated by `ml-2`.

### Docs page (`/docs`)
Two-column layout: sticky "On this page" anchor nav on the left, prose content on the right. Sections styled with teal headings, numbered step cards, `Tip` (teal) and `Warn` (amber) callouts.

## Motions

| Motion | Where | How |
|--------|-------|-----|
| Marquee | Landing phrase strip | `@keyframes marquee` translateX 0→-50%, 38s linear infinite, masked edges |
| Pulse | "Sending" / "in queue" dots | `animate-pulse` with optional glow shadow |
| Hover | Buttons, icon buttons, nav | 150ms color transitions |

## Do's and Don'ts

### Do
- Use teal-500 (`#57aa43`) for the primary CTA and dark `text-slate-50` text on it.
- Keep every floating surface a `.card` — hairline border + inset highlight, no heavy shadows.
- Use `text-slate-400`/`text-slate-500` ramps for metadata; reserve bright text for values the user acts on.
- Pin the pulsing dot to live states only (sending, in queue).
- Use Stack Sans Notch only for the hero display line.
- Reuse the exported component classes (`card`, `btn-*`, `input`, `label`, `badge`) instead of inventing variants.

### Don't
- Don't add a second accent color — teal is the whole chromatic budget.
- Don't use panels with hard full-opacity white borders; keep them at 6–10% white.
- Don't set body text below ~11px except inside mockups where it's mimicking the app.
- Don't drop Stock Sans Notch into buttons or body — it's display-only.
- Don't use em dashes in copy (project convention: commas/semicolons instead).

## Quick Color Reference

- background: `#020617` slate-950
- surface: `rgba(255,255,255,0.03)`
- border: `rgba(255,255,255,0.08)`
- primary action: `#57aa43` teal-500 (hover `#81c14b`)
- primary text: `#f1f5f9` slate-100
- secondary text: `#94a3b8` slate-400
- icon: lucide-react, `text-slate-400`
- danger: `#ef4444` red-500 derivatives

## Similar Brands

- **Linear** — dark canvas, single accent, hairline borders, product-first mockups.
- **Vercel** — near-black background, restrained accent, editorial display type.
- **PostHog / Stripe dark** — midnight canvas with one saturated accent and flat elevation.