# Sthanam: Map Poster Creator

A React + Next.js app that turns any location into a customizable, poster-quality map print. Free watermarked preview; paid tiers at ₹10/15/20 for clean files up to 4320×5400 (A2 at 300 DPI). Full Devanagari support with 8 Indic fonts plus 14 Latin faces.

**Live:** https://sthanam.madhur.me  
**GitHub:** https://github.com/Madhurboard/sthanam-map-creator

---

## Status

| Component | Environment | Status |
|---|---|---|
| Frontend | Vercel (`sthanam.madhur.me`) | ✅ Live |
| Backend | Render (`sthanam-map-creator.onrender.com`) | ✅ Live |
| Database | Supabase (ap-south-1 / Mumbai) | ✅ Live |
| Payments | Razorpay | ⏳ KYC pending (using placeholders) |

All three tiers ship. Free tier works completely. Paid tiers reach checkout but fail without real Razorpay credentials.

---

## Architecture

### Frontend (`frontend/`)

Next.js 15 / React 19 / TypeScript. Monorepo workspace.

**Key files:**
- `components/Poster.tsx` — the poster preview; owns all export DOM ids
- `components/Sidebar.tsx` — five tabs (Place, Style, Type, Size, Export)
- `lib/map-engine.ts` — dual Leaflet (raster) + MapLibre (vector) maps, kept in sync
- `lib/export.ts` — Web Mercator compositor, html2canvas pipeline, watermarking
- `lib/fonts.ts` — 22 next/font faces (14 Latin, 8 Devanagari), script detection
- `lib/pricing.ts` — tier definitions (mirrors backend)
- `lib/map-state.tsx` — React Context + useReducer, localStorage-backed (33 fields)

**Design:**
- Poster DOM laid out at full output resolution, scaled visually via `transform: scale()`
- Export renders 1:1 at scale 1; other tiers = targetWidth / state.width
- All export logic depends on element IDs, not classes: `poster-container`, `map-preview`, `artistic-map`, `mat-border`, `vignette-overlay`, `poster-overlay`, `display-city`, `display-country`, `display-coords`, `poster-divider`, `poster-attribution`
- Maps set `position: absolute` inline to override vendor CSS specificity

**Environment:**
- `NEXT_PUBLIC_API_URL` — backend URL (baked in at build time; redeploy after changing)
- `NEXT_PUBLIC_SKIP_PAYMENT=1` — dev bypass for paid tiers (inert in production builds)

### Backend (`backend/`)

Express + TypeScript. Monorepo workspace. Builds and deploys from `backend/` root directory only (112 packages, vs. pulling frontend deps).

**Key files:**
- `src/index.ts` — server entry; raw-body parser on webhook route only
- `src/lib/env.ts` — environment validation (exits 1 if missing/placeholder credentials; warns on startup)
- `src/lib/pricing.ts` — authoritative tier table; client sends tier id, never amount
- `src/lib/supabase.ts` — Supabase client (service_role key, bypasses RLS)
- `src/routes/payment.ts` — `/create-order`, `/verify`, `/webhook` (timing-safe HMAC-SHA256)
- `src/routes/export.ts` — `/pricing`, `/generate-token`, `/validate` (single-use token redemption)

**Money rules (must not regress):**
1. Prices come from `lib/pricing.ts`, never the request body
2. Signature comparisons use `crypto.timingSafeEqual`
3. Webhook verifies against **raw** request bytes (mounted before `express.json()`)
4. Token redemption is a conditional update `.eq('used', false)` so concurrent requests can't both claim it

**Environment:**
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — database connection
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — payment processor
- `FRONTEND_URL` — CORS allowlist (comma-separated; includes `localhost:3000`, `sthanam.madhur.me`, Vercel domain)
- `NODE_ENV=production` — forces placeholder detection on boot
- `PORT` — injected by Render; code reads it

### Database (Supabase)

PostgreSQL in Mumbai (`ap-south-1`). Schema in `backend/supabase-schema.sql`.

**Tables:**
- `users` — optional; not yet used
- `orders` — one row per Razorpay order; created at order-creation time, updated at verify/webhook
- `download_tokens` — one row per valid token; single-use redemption via `.eq('used', false)` atomic update

**Security:**
- RLS enabled on all three tables
- `service_role` key (backend only) bypasses RLS
- Public `anon` key (shipped to browser) has **no policies** — REVOKE ALL on all three tables
- No user-facing queries to orders or tokens; all server-side

---

## Deployment

### Vercel (Frontend)

**URL:** https://sthanam-map-creator-madhurboards-projects.vercel.app  
**Custom domain:** https://sthanam.madhur.me (CNAME, grey-clouded on Cloudflare)

**Settings:**
- Framework: Next.js
- Root Directory: `frontend`
- Build Command: *(auto-detected)*
- Environment Variables:
  - `NEXT_PUBLIC_API_URL` = https://sthanam-map-creator.onrender.com

**Deploy:** Push to `main` auto-deploys via GitHub integration.

### Render (Backend)

**URL:** https://sthanam-map-creator.onrender.com

**Settings:**
- Runtime: Node
- Root Directory: `backend`
- Build Command: `npm ci --include=dev && npm run build`
- Start Command: `npm run start`
- Instance Type: Free (512 MB RAM, 0.1 CPU; spins down after 15 min idle)
- Region: Singapore
- Environment Variables:
  - `SUPABASE_URL` = https://xnqdinyjhdvojhfrlian.supabase.co
  - `SUPABASE_SERVICE_KEY` = *(secret; from dashboard)*
  - `RAZORPAY_KEY_ID` = placeholder *(or real test key)*
  - `RAZORPAY_KEY_SECRET` = placeholder *(or real test secret)*
  - `FRONTEND_URL` = https://sthanam.madhur.me,https://sthanam-map-creator-madhurboards-projects.vercel.app

**Deploy:** Push to `main` auto-deploys via GitHub; free instances cold-start ~50s.

### DNS (Cloudflare)

**sthanam.madhur.me** — CNAME to Vercel's nameservers

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | sthanam | (Vercel CNAME) | DNS only 🔵 |

**Critical:** Grey cloud only. Orange-clouded, Vercel's certificate challenge fails and you get "Invalid Configuration".

---

## Local Development

```bash
npm install
npm run dev
# frontend :3000, backend :4000

# Or separately:
npm run dev:frontend
npm run dev:backend
```

**Environment files (gitignored):**
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `backend/.env.local` — Supabase creds (real), Razorpay (placeholders OK)

**Typecheck & build:**
```bash
npx tsc --noEmit                 # frontend
npm run build:backend
npm run build:frontend
```

**Testing paid tiers without Razorpay:**
```bash
NEXT_PUBLIC_SKIP_PAYMENT=1 npm run dev:frontend
# Free & paid tiers both render; "Pay ₹X" button does nothing, goes straight to export
```

---

## Key Technical Decisions

### Map Engine (Dual Leaflet + MapLibre)

Standard view uses Leaflet with raster tiles (CARTO/OSM). Artistic mode uses MapLibre GL with vector tiles (OpenFreeMap).

**Sync logic:**
- `isSyncing` guard prevents feedback loops
- Artistic runs at `zoom - 1` (512px vs 256px tiles)
- Marker drag maintains position across both engines
- `generation` counter in Render prevents StrictMode double-mount race

**Critical:** Vendor CSS must load **before** Tailwind. MapLibre's `.maplibregl-map { position: relative }` ties with Tailwind's `.absolute` on specificity; without careful order, the map collapses to 0 height.

### Export Pipeline

Two stages: **capture** (map snapshot), then **compose** (html2canvas with DOM surgery).

**Capture:**
- Leaflet: reads canvas directly (raster tiles already rendered)
- MapLibre: WebGL readback via `canvasContextAttributes: { preserveDrawingBuffer: true }`
- Web Mercator math for accurate marker positioning under transformation

**Compose:**
- html2canvas renders the full poster at scale 1
- `onclone` callback rewrites inline styles, swaps in the map snapshot canvas
- Applies mat frame, border, vignette
- Positions overlay with edge-clamp bounds checking
- Canvas limits enforced: 16384px edge, 268M pixel area (browser + WebGL caps)

**Watermark:** Diagonal "STHANAM PREVIEW" at `stepX = fontSize * 13`, `stepY = fontSize * 7`. Two-pass (white + black) for theme-agnostic visibility.

### Devanagari Support

**Script detection:** `containsDevanagari()` checks for U+0900–U+097F codepoints.

**Typography:** Matras (diacritics) attach above/below consonants and break if tracked apart. Solution: dynamic letter-spacing:
- Devanagari: `0.04em` (city) / `0.12em` (country)
- Latin: `0.25em` (city) / `0.4em` (country)

**Fonts:** next/font self-hosts 8 Devanagari faces so exports never lose a conjunct. Migration from literal family names to CSS variables via `migrateFontValue()` in `fonts.ts`.

### Pricing: ₹10 / ₹15 / ₹20

**Why low?**
- Impulse territory; below the "think" threshold
- Raises volume requirement but lowers trust friction
- Infrastructure cost (~₹1.50 per session) is now 7.5% of revenue, worth monitoring

**Why spread?**
- Tiers exist only to anchor ₹20 as "reasonable". No steering power at ₹5 gaps.
- Expect almost everyone to take Print (4×).
- Plan: collapse to single paid tier once traffic validates demand.

---

## What's Left to Ship

### Blocking
1. **Map tile licensing** — CARTO/OSM raster tiles are "light, non-commercial use" only. Selling the output breaks their terms. Solution: move to MapTiler/Stadia/Mapbox (paid), self-host, or ship vector-only. (Vector themes run on OpenFreeMap, which is fine.)

2. **Geocoder licensing** — Public Nominatim is capped at 1 req/sec and forbids commercial bulk use. A live launch gets blocked. Solution: LocationIQ, Photon, or hosted Nominatim (₹few thousand/month).

### High-Value
3. **Email delivery** — Files download once client-side; a dropped connection = charged customer with nothing. Solution: email the token on `payment.captured`, allow redemption multiple times within 24h. Highest single ROI left.

4. **Razorpay KYC** — Business entity registration + Know Your Customer docs. Placeholder credentials work for dev; real payments need this.

### Nice-to-Have
- City landing pages (SEO for "Mumbai map poster" etc.)
- Gift flow (mail file to someone else)
- Physical print fulfillment (Printful etc.; inventory trap — only after digital validates)
- More Indic scripts (Tamil, Bengali, Telugu, Gujarati, Kannada — same engineering, one array)

---

## Gotchas

1. **Vendor CSS specificity:** MapLibre vs Tailwind `.absolute` — resolved by import order in `layout.tsx`. If maps disappear, check CSS loading order first.

2. **MapLibre 5 WebGL:** Moved `preserveDrawingBuffer` to `canvasContextAttributes`. Without it, artistic exports come out blank.

3. **StrictMode double-mount:** React dev mode mounts/unmounts/remounts. Generation counter in `map-engine.ts` aborts superseded inits.

4. **Tile loading timing:** Leaflet streams tiles lazily. Early export call leaves blank wedges. Fixed by `waitForTilesLoad()` and `waitForPendingTileImages()`.

5. **Canvas limits are real:** Browsers refuse edges >~16384px and areas >~268M pixels. `export.ts` clamps and warns the user.

6. **Letter-spacing breaks Devanagari:** Conjuncts detach. Script detection enables context-aware tracking. Always test both Latin and Indic before changing typography.

7. **Environment variables baked in:** `NEXT_PUBLIC_*` are compile-time. Changes require a redeploy, not a server restart.

8. **Free Render instance sleeps:** 15 min idle → ~50s cold-start. Before taking real payments, upgrade to Starter ($7/mo) or add a keep-alive ping.

---

## Credentials & Secrets

**Stored locally (gitignored):**
- `backend/.env.local` — Supabase service key, Razorpay keys
- `frontend/.env.local` — API base URL (localhost for dev, onrender.com for production)

**In Render (encrypted secrets):**
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — read-only view at dashboard
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — placeholder until KYC clears
- `FRONTEND_URL` — CORS allowlist

**In Vercel (encrypted secrets):**
- `NEXT_PUBLIC_API_URL` — backend URL (visible in bundle after build; that's OK, it's not a secret)

**Never commit:**
- `.env` files (all — use `.env.local` locally)
- Actual Razorpay/Supabase credentials to git

---

## Testing & Verification

**No automated tests.** Verify by running the app:

```bash
npm run dev
# At http://localhost:3000:
# 1. Search a city
# 2. Try both Standard and Artistic modes
# 3. Check Devanagari title renders as connected clusters (e.g., मुंबई, not म ु ंब ई)
# 4. Download free tier → should have watermark, ~1200px max
# 5. NEXT_PUBLIC_SKIP_PAYMENT=1, download paid tier → no watermark, full size
# 6. Check browser console for errors
```

**Live verification:**
```bash
# Frontend
curl https://sthanam.madhur.me

# Backend
curl https://sthanam-map-creator.onrender.com/api/health
curl https://sthanam-map-creator.onrender.com/api/export/pricing

# CORS (test from Vercel domain)
curl -i -H "Origin: https://sthanam-map-creator-madhurboards-projects.vercel.app" \
  https://sthanam-map-creator.onrender.com/api/health
# Should include: access-control-allow-origin: https://sthanam-map-creator-madhurboards-projects.vercel.app
```

---

## Next Steps

1. **Razorpay KYC:** File business entity & Know Your Customer to unlock real credentials.
2. **Email delivery:** Implement post-payment email with download link. Highest ROI.
3. **Tile licensing:** Move raster themes to a licensed provider (or vector-only) to cover commercial use.
4. **Geocoder upgrade:** LocationIQ or similar to replace public Nominatim before driving real traffic.
5. **City landing pages:** Static generation for major cities (Mumbai, Delhi, Bengaluru, etc.). Natural SEO play.

---

## Files Changed

`AGENTS.md` — Architecture & gotchas  
`render.yaml` — Render Blueprint (mirrors UI settings)  
`frontend/vercel.json` — Vercel config  
`frontend/.env.example`, `backend/.env.example` — Template credentials  
`backend/src/lib/env.ts` — Credential validation & warnings  
`frontend/next.config.ts` — Fixed localhost proxy (dev-only)  
`.gitignore` — Updated to allow `.env.example` tracking  

All pricing & payment logic is in `backend/src/lib/pricing.ts` (authoritative) and `frontend/src/lib/pricing.ts` (display). Keep them in sync.

---

**Deployed:** August 23, 2026  
**Last touched:** $BRANCH  
**Status:** Feature-complete, awaiting Razorpay KYC to take real payments
