# AGENTS.md - Sthanam Map Art Creator

## Project Overview

**Sthanam** (स्थानम्) turns any location into a poster-quality map print. Users search a
place, pick a map theme, set typography in Latin **or Devanagari**, and download the
result. Full-resolution downloads are paid; a watermarked preview is free.

The repo is an npm workspaces monorepo with three parts:

| Path | What it is | Status |
|------|-----------|--------|
| `frontend/` | Next.js 15 / React 19 / TypeScript app | **Active** — the product |
| `backend/` | Express + TypeScript payments API (Razorpay + Supabase) | **Active** |
| `src/`, `main.js`, `index.html` | Original vanilla-JS + Vite app | Legacy — still deployed at `sthanam.vercel.app`; kept as reference and fallback, not the target of new feature work |

`sthanam-app/` is dead scaffolding from an abandoned migration. Ignore it.

---

## Commands

```bash
npm run dev              # frontend (:3000) + backend (:4000) together
npm run dev:frontend
npm run dev:backend
npm run build            # builds both workspaces
```

Per workspace: `npx tsc --noEmit` typechecks. **There is no test runner or linter
configured** — verify changes by running the app (see "Verifying changes" below).

---

## Frontend architecture (`frontend/src/`)

```
app/
  layout.tsx           Vendor CSS first, then globals; applies every font variable to <body>
  page.tsx             MapStateProvider + MapCreator
components/
  MapCreator.tsx       Shell: header + Poster + Sidebar; loads Poster with ssr:false
  Poster.tsx           THE poster preview — owns the exported DOM ids, drives the map engine
  Sidebar.tsx          Five tabs: Place / Style / Type / Size / Export
  LocationSearch.tsx   Debounced Nominatim search with keyboard nav
  FontPicker.tsx       Font dropdown grouped by script
  PresetsModal.tsx     Full size catalogue
  ExportPanel.tsx      Tier selection + download / checkout CTA
hooks/
  useExport.ts         Free download, or create-order → Razorpay → verify → redeem → render
  useDraggableOverlay.ts
lib/
  map-state.tsx        Context + reducer, localStorage-backed (SAVED_KEYS)
  map-engine.ts        Dual engine singleton: Leaflet (raster) + MapLibre (vector)
  export.ts            Map compositor + html2canvas pipeline, watermarking, canvas limits
  fonts.ts             All 22 next/font faces, Latin + Devanagari, plus legacy migration
  pricing.ts           Tier table (mirrors backend/src/lib/pricing.ts)
  api.ts               Backend client
  themes.ts / artistic-themes.ts / output-presets.ts / marker-icons.ts / maplibre-style.ts / geocoder.ts / utils.ts
```

### Key patterns

- **The poster DOM is laid out at full output resolution** (`state.width` × `state.height`
  CSS px) and shrunk visually with a `transform: scale()` on `#poster-scaler`. The export
  therefore renders 1:1 at scale 1, and `scale = targetWidth / state.width` for other tiers.
- **The export depends on element ids**, not classes: `poster-container`, `poster-scaler`,
  `map-preview`, `artistic-map`, `mat-border`, `vignette-overlay`, `poster-overlay`,
  `display-city`, `display-country`, `display-coords`, `poster-divider`,
  `poster-attribution`. Renaming any of them silently breaks the corresponding branch of
  `export.ts`'s `onclone`.
- **`map-engine.ts` is a module singleton**, mirroring the vanilla app, so `export.ts` can
  reach the map instances without prop drilling. `setStateUpdater()` wires it to dispatch.
- **Fonts are CSS variables**, e.g. `var(--font-playfair), serif` — never literal family
  names, because next/font hashes the real family name at build time.

---

## Code style

- **Indentation**: tabs. **Quotes**: single. **Semicolons**: required. **Braces**: K&R.
- Named exports for modules; default exports for React components (Next convention).
- `camelCase` functions, `UPPER_SNAKE_CASE` constants, `snake_case` theme keys with
  Sanskrit display names (`arctic_frost` → "Hima (Frost)").
- Comments explain *why*, not *what*. The codebase is deliberately light on them.

### Design system: True Liquid Glass

| Property | Value |
|----------|-------|
| Unselected button | `bg-white/10 backdrop-blur-sm border border-white/15 text-white` |
| Selected/active | `bg-accent text-white ring-2 ring-accent/30` |
| Glass panel | `liquid-glass` (see `globals.css`) |
| Section labels | `label-sm` — `text-white/60 uppercase text-[10px] font-bold tracking-wider` |
| Inputs | `input-field` |
| Corner radius | `rounded-3xl` panels, `rounded-xl` buttons/inputs |
| Accent | `--accent-color-rgb: 59, 130, 246` |

---

## Backend (`backend/src/`)

```
index.ts            Express app; raw-body parser mounted on the webhook route only
lib/pricing.ts      Authoritative tier prices — the client sends a tier id, never an amount
lib/tokens.ts       issueDownloadToken()
lib/razorpay.ts     lib/supabase.ts
routes/payment.ts   create-order (persists a pending order) / verify (settles + issues token) / webhook
routes/export.ts    pricing / generate-token / validate (single-use redemption)
```

Schema lives in `backend/supabase-schema.sql`. Run it in the Supabase SQL editor.

**Money rules that must not regress:**
1. Prices come from `lib/pricing.ts`, never from the request body.
2. Signature comparisons use `crypto.timingSafeEqual`.
3. The webhook verifies against the **raw** request bytes, so it is mounted before
   `express.json()`.
4. Token redemption is a conditional update (`.eq('used', false)`) so concurrent requests
   cannot both claim it.

---

## Verifying changes

There are no automated tests, so drive the real app:

```bash
npm run dev:frontend
```

Then check, at minimum:
1. Standard (Leaflet) and Artistic (MapLibre) modes both render the map.
2. A Devanagari title (`मुंबई`) with a Devanagari font renders as connected clusters.
3. A free download produces a watermarked PNG.
4. `NEXT_PUBLIC_SKIP_PAYMENT=1 npm run dev` lets you export a paid tier without Razorpay —
   confirm the 4× "Print" tier has no watermark and the map fills the frame.

---

## Gotchas

1. **Vendor CSS must load before `globals.css`.** MapLibre's `.maplibregl-map { position:
   relative }` ties with Tailwind's `.absolute` on specificity; if it wins, the map
   container collapses to zero height. The map containers also set `position` inline as a
   second line of defence.
2. **MapLibre 5 moved `preserveDrawingBuffer`** under `canvasContextAttributes`. Without
   it, artistic-theme exports come out blank.
3. **Artistic mode runs at `zoom - 1`** relative to Leaflet (512px vs 256px tiles).
4. **StrictMode double-mounts.** `map-engine.ts` uses a `generation` counter so an init
   that was superseded while awaiting its dynamic imports abandons its work.
5. **Wait for tiles before compositing.** Leaflet streams tiles in lazily; exporting early
   leaves blank wedges at the poster edges.
6. **Canvas limits are real.** Browsers refuse edges beyond ~16384px and areas beyond
   ~268MP; WebGL buffers cap far lower. `export.ts` clamps for both and tells the user.
7. **Devanagari and letter-spacing don't mix.** Tracking display Latin apart looks great;
   doing it to Devanagari detaches matras from their consonants. `Poster.tsx` reduces
   tracking when it detects Devanagari.
8. **`SAVED_KEYS` in `map-state.tsx`** must be updated for any new persisted field.
9. **No SSR for the poster** — `MapCreator` loads it with `ssr: false`, and settings are
   read from localStorage in an effect, not during render.
