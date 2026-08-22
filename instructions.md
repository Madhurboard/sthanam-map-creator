# Sthanam UI Fix Instructions for Parallel Agents

> **Context**: Sthanam is a single-page map art creator at `d:\Sthanam\index.html` with a `d:\Sthanam\style.css`. The app uses **Tailwind CSS** (via CDN) and targets a **True Liquid Glass** Apple-inspired aesthetic over an animated dark gradient background. The server runs on `http://localhost:5173` via `npm run dev`.

---

## UI Audit Summary (Current State)

| Element | Visible | Legible | Functional | Status |
|---|---|---|---|---|
| Animated gradient background | ✅ | — | ✅ | Good |
| Sidebar glass panel | ✅ | ✅ | ✅ | Good (slightly opaque) |
| Tab nav (Location/Style/Size/Tweaks/Export) | ✅ | ⚠️ | ✅ | Unselected tabs too faint |
| Map poster — City name | ✅ | ✅ | ✅ | Good |
| Map poster — Subtitle (Country) | ✅ | ⚠️ | ✅ | **Overlaps** with coordinates |
| Map poster — Coordinates | ✅ | ⚠️ | ✅ | **Overlaps** with subtitle |
| Location tab — Search input | ✅ | ✅ | ✅ | Good |
| Location tab — Custom Title input | ✅ | ✅ | ✅ | Good |
| Location tab — Subtitle/Region input | ✅ | ✅ | ✅ | Good |
| Location tab — Lat/Lng inputs | ✅ | ✅ | ✅ | Good |
| Style tab — Standard/Artistic toggle | ✅ | ✅ | ✅ | Good |
| Style tab — Theme cards (Aatma, Bhasma...) | ✅ | ⚠️ | ✅ | Cards are **white/opaque**, clash with glass UI |
| Size tab — Square/Portrait/Landscape buttons | ✅ | ⚠️ | ✅ | **White opaque** buttons clash with dark glass sidebar |
| Size tab — "Other" button | ⚠️ | ❌ | ✅ | Button text **invisible** on dark background |
| Size tab — Custom W×H inputs | ✅ | ⚠️ | ✅ | Dark text on dark input – hard to read |
| Size tab — Reset to Defaults button | ✅ | ✅ | ✅ | Dark maroon/crimson, decent |
| Tweaks tab — Zoom slider | ✅ | ✅ | ✅ | Good |
| Tweaks tab — Filter Effect (None/Vignette) | ✅ | ⚠️ | ✅ | **White opaque** buttons clash with dark sidebar |
| Tweaks tab — Filter Intensity (None/Light/Medium/Strong) | ✅ | ⚠️ | ✅ | **White opaque** buttons on dark sidebar |
| Tweaks tab — Lighting Position 3×3 grid | ✅ | ⚠️ | ✅ | **White opaque** cells on dark sidebar |
| Export tab — Generate Export button | ✅ | ✅ | ✅ | Good (bright blue, visible) |
| Export tab — Content | ⚠️ | — | — | **Empty space** above button, no resolution options shown |

---

## Fix Tasks for Parallel Agents

All 6 agents completed on 2026-03-02.

| Agent | Task | Status |
|---|---|---|
| 1 | Map Poster Text Overlap | ✅ DONE (user fixed + `form.js` spacing scale) |
| 2 | Style Tab Theme Cards | ✅ DONE (`bg-white/10 backdrop-blur-sm`, white text, glass active state) |
| 3 | Size Tab Preset Buttons | ✅ DONE (glass buttons, white text, fixed "Other" visibility) |
| 4 | Tweaks Tab Opaque Buttons + 3×3 Grid | ✅ DONE (glass tiles, active ring-accent) |
| 5 | Tab Navigation Legibility | ✅ DONE (`text-white/75` inactive, `hover:text-white hover:bg-white/5`) |
| 6 | Export Tab Resolution Selector | ✅ DONE (HD/2K/4K buttons wired to `main.js` export multiplier) |

---

## Work Log

| Date | Summary |
|---|---|
| 2026-03-02 | Initial audit, all 6 fix tasks defined |
| 2026-03-02 | All 6 agents completed. Glass theme applied across tabs, size preset buttons, 3×3 grid, art cards, filter toggles, pin options. Export HD/2K/4K resolution selector added and wired to export. |

---

### Agent 1 — Fix: Map Poster Text Overlap

**File**: `d:\Sthanam\index.html`

**Problem**: The subtitle (e.g., "JAPAN") and coordinates line (e.g., "35.67° N, 139.77° E") overlap with each other on the map poster when using certain map art themes. The vertical spacing between these two text elements is insufficient.

**Root Cause**: The container div uses `space-y-0` or `mb-0` which collapses vertical margin. Text elements also need proper `line-height`.

**Fix Instructions**:
1. Find the element with id `poster-overlay` (around line 517).
2. Inside it, find the `<div class="flex flex-col items-center ...">` that wraps `#display-country` and `#display-coords`.
3. Ensure that container uses **at minimum** `space-y-2` between elements.
4. Add `leading-normal` to both `#display-country` (the subtitle `<p>` tag) and `#display-coords`.
5. Add `mb-1` to `#display-country` and remove any `mb-0` overrides.
6. Also add a `mt-2` to the wrapper div itself for breathing room after the divider.

**Expected result**: "TOKYO / JAPAN / 35.67° N" are all clearly separated with no overlap.

---

### Agent 2 — Fix: Style Tab Theme Cards (Opaque White)

**File**: `d:\Sthanam\index.html` and/or `d:\Sthanam\style.css`

**Problem**: The artistic theme selection cards (Aatma, Aranya, Bhasma, Chini, Chitra, Ekranga, Hemant, Hima, etc.) have a **solid white / off-white background** (`bg-white` or `bg-slate-50`). On the dark glass sidebar, these look like garish white blocks that shatter the Apple liquid glass aesthetic.

**Fix Instructions**:
1. Find all the theme card buttons inside the `data-tab-content="style"` section.
2. Replace any `bg-white`, `bg-slate-50`, `bg-white/5` classes on these cards with `bg-white/10`.
3. Add `backdrop-blur-sm` to each card.
4. Add a subtle border: `border border-white/15`.
5. For the **selected/active state**, the card should use `bg-white/25 border-white/40 ring-2 ring-white/30`.
6. Ensure the card label text (e.g., "Aatma (Ethereal)") uses `text-white` so it reads on the dark glass surface.

**Expected result**: All theme cards look like frosted glass tiles, not white paper cards.

---

### Agent 3 — Fix: Size Tab Preset Buttons (Opaque White)

**File**: `d:\Sthanam\index.html`

**Problem**: The SIZE tab has preset buttons — Square, Portrait, Landscape, Other — with solid white/near-white backgrounds. These look visually inconsistent with the dark glass panel. The "Other" button is especially broken: it has dark (near-black) text on a dark background, making it completely invisible.

**Fix Instructions**:
1. Find the preset size buttons in `data-tab-content="size"` section.
2. Replace each button's background:
   - Unselected: change `bg-white` / `bg-slate-50` → `bg-white/10`
   - Add `backdrop-blur-sm border border-white/15`
   - Text color: ensure all button labels use `text-white`
   - Sub-labels (like "1080 × 1080"): use `text-white/60`
3. For the **selected/active** state: use `bg-accent ring-2 ring-accent/50 text-white` (keep the existing blue accent).
4. For the "Other / More Sizes" button specifically: ensure it has `text-white` label, not dark text on dark background.
5. The custom dimension inputs (`W × H`) should have `text-white` and a `placeholder-white/40` to be readable.

**Expected result**: All size preset buttons are uniformly translucent glass tiles. The "Other" button label is clearly readable.

---

### Agent 4 — Fix: Tweaks Tab Opaque Buttons and 3×3 Grid

**File**: `d:\Sthanam\index.html`

**Problem**: Three groups of controls on the TWEAKS tab use **solid white/opaque button backgrounds** which clash with the dark glass sidebar:
1. **Filter Effect** group: "None" and "Vignette" buttons are white.
2. **Filter Intensity** group: "None", "Light", "Medium", "Strong" buttons are white.
3. **Lighting Position 3×3 grid**: 9 grid cells are large white squares — completely inconsistent.

**Fix Instructions**:
1. Find the Tweaks tab section (`data-tab-content="tweaks"` or similar).
2. For **Filter Effect** and **Filter Intensity** pill/toggle buttons:
   - Unselected state: `bg-white/10 text-white border border-white/15 backdrop-blur-sm`
   - Selected/active state: Keep the existing `bg-accent text-white` blue.
3. For the **3×3 Lighting Position grid cells**:
   - Each cell should be: `bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl`
   - Active/selected cell: `bg-white/30 border-white/40 ring-2 ring-accent/40`
   - The small dot indicator inside each cell: keep as-is or use `bg-white/60`.
4. Leave the **Zoom Level slider** as-is (it looks fine).

**Expected result**: All buttons and grid cells look like translucent glass tiles consistent with the Apple liquid glass aesthetic.

---

### Agent 5 — Fix: Tab Navigation Legibility

**File**: `d:\Sthanam\index.html`

**Problem**: The tab navigation bar (LOCATION | STYLE | SIZE | TWEAKS | EXPORT) has **unselected tabs** that are nearly invisible. Their text uses `text-white/60` or `text-white/40` which becomes illegible against the dark glass surface. Additionally, the active tab underline needs to be more prominent.

**Fix Instructions**:
1. Find all `desktop-tab-btn` class elements in the tab nav (around line 102–107 in `index.html`).
2. For **unselected** tab buttons: change their text color from `text-white/60` to `text-white/75`.
3. For **unselected hover** state: change from `hover:text-white/70` to `hover:text-white`.
4. For the **active tab**: ensure it uses `text-white font-bold` and a visible `border-b-2 border-accent` underline.
5. Optionally add a subtle `hover:bg-white/5 rounded-md` to unselected tabs for better interactivity cue.

**Expected result**: All tab labels are clearly readable; the active tab is obviously highlighted.

---

### Agent 6 — Fix: Export Tab — Add Resolution Selector UI

**File**: `d:\Sthanam\index.html` and `d:\Sthanam\src\ui\form.js`

**Problem**: The EXPORT tab is mostly empty — a huge whitespace void above the "Generate Export" button. It should offer **resolution options** (e.g., HD 1x, 2K 2x, 4K 4x) that users can select before exporting.

**Fix Instructions**:
1. In the `data-tab-content="export"` div in `index.html`, add a section above the "Generate Export" button:
   - Add an `<h3>` label: "Export Resolution" using `label-sm` styling.
   - Add three radio-style toggle buttons: `HD (1×)`, `2K (2×)`, `4K (4×)`. These should use the same glass button style as the Tweaks tab toggle buttons (glass tile with active = blue accent).
   - Give each button a `data-multiplier` attribute: `1`, `2`, `4`.
   - Default selected: `HD (1×)`.
2. In `d:\Sthanam\src\core\export.js` (or wherever `generateExport` is called), read the selected multiplier and scale the canvas output accordingly.
3. Style consistently: use `bg-white/10 text-white border border-white/15` for unselected, `bg-accent text-white` for selected.

**Expected result**: Users can choose HD, 2K, or 4K before clicking Generate Export.

---

## General Design Principles for All Fixes

All changes must align with the **True Liquid Glass** Apple design system used throughout this app:

| Property | Value |
|---|---|
| Unselected button background | `bg-white/10 backdrop-blur-sm` |
| Unselected button border | `border border-white/15` |
| Unselected button text | `text-white` or `text-white/80` |
| Selected/active button | `bg-accent text-white ring-2 ring-accent/30` |
| Glass panel surface | `bg-white/5` or `bg-black/30 backdrop-blur-xl` |
| Section header labels | `text-white/50 uppercase text-[10px] font-bold tracking-widest` |
| Input fields | `bg-white/10 border border-white/15 text-white placeholder-white/40` |
| Corner radius (large panels) | `rounded-3xl` (24px) |
| Corner radius (buttons/inputs) | `rounded-xl` (12px) |
| Corner radius (pill buttons) | `rounded-full` |

---

## Files Overview

| File | Purpose |
|---|---|
| `d:\Sthanam\index.html` | All HTML structure — tabs, sidebar, inputs, map poster |
| `d:\Sthanam\style.css` | Tailwind `@apply` based component styles (`.glass-card`, `.liquid-glass`, `.input-field`, `.label-sm`) |
| `d:\Sthanam\src\ui\form.js` | JS logic for tab switching, input handling, map updates |
| `d:\Sthanam\src\core\export.js` | Map canvas export logic |
| `d:\Sthanam\src\map\renderer.js` | Map tile rendering / artistic effect application |

---

*Audit performed: 2026-03-02. App running on `http://localhost:5173` via `npm run dev` in `d:\Sthanam`.*
