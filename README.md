# 🎭 Meme Studio Feed

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node-%5E20.19%20%7C%7C%20%3E%3D22.12-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/license-MIT-black?style=flat-square" alt="License" />
</p>

> One homepage, two audiences. A **Browse** mode built for people who just want
> a funny thing to download and share, and an **Editor Mode** that reflows the
> same page into a dense, filterable asset library for video editors.

---

## 📦 Requirements

> [!IMPORTANT]
> Vite 8 requires **Node `^20.19.0 || >=22.12.0`**. If this machine's default
> `node` is older (e.g. v12), the dev server and build will not run.

```bash
nvm use 26          # or any Node >= 22.12
npm install
npm run dev
npm run build
npm run lint
```

> [!WARNING]
> If `npm install` runs under an old Node/npm 6, npm resolves the wrong
> architecture for Tailwind's native `@tailwindcss/oxide` binary and the build
> fails with `Cannot find module '@tailwindcss/oxide-darwin-arm64'`.
> **Fix:** re-run `npm install` under Node >= 22.

---

## 🧭 The Two Modes

Mode lives in `StudioProvider` and is persisted to `localStorage` under
`msf.mode`, so returning users land where they left off. Each mode is a
separate `React.lazy` chunk — **Browse users never download the virtualized
editor grid.**

| Mode | For | Includes |
|---|---|---|
| 🎭 **Browse** | Casual scrollers | Auto-advancing story reel, one-tap Download / Share, Meme of the Day spotlight, mood-based filtering, sound-only grab strip, reaction-annotated feed |
| 🎬 **Editor Mode** | Video editors | Filter rail (format, aspect, license, transparency, green screen, sound, duration), batch-select checkboxes, bulk `.zip` bar, per-asset metadata, inline scrub bar, copy-link / copy-embed, Project Kits |

---

## 🗂️ Structure

```
src/
  components/   Navbar, ModeToggle, SearchOverlay, MoodPicker, MemeOfTheDay,
                StoryReel, BrowseFeed, MemeCard, SoundGrabStrip,
                EditorModeLayout, FilterPanel, AssetCard, PreviewPlayer,
                BulkDownloadBar, ProjectKits, SubNav, StreakToast,
                DownloadButton
  store/        StudioProvider (state) + studioStore (context & hook)
  hooks/        useLocalStorage, useDebounce, useMediaQuery
  data/         assets.js — 480 deterministic mock assets, SFX, moods
```

---

## 🎨 Visual Identity

Tokens live in the `@theme` block of `src/index.css`, so they are real
Tailwind utilities (`bg-char`, `bg-cream`, `text-volt`, `text-mist`).

| Token | Value | Use |
| --- | --- | --- |
| 🖤 `char` / `char-2` / `char-3` | `#111114` / `#17171C` / `#1F1F26` | warm charcoal base |
| 🤍 `cream` / `cream-2` | `#FAF7F2` / `#EFEAE1` | editorial content cards |
| ⚡ `volt` / `volt-hi` | `#7C3AED` / `#9061F9` | the single accent |
| ✒️ `ink` / `ink-soft` | `#16151A` / `#57545F` | text on cream |
| 🌫️ `mist` | `#9A97A4` | secondary text on charcoal |

Display type is **Anton** (condensed, meme-poster energy), UI type is **Inter**.

**✂️ Signature detail:** thumbnails are die-cut like stickers torn off a sheet
— three `clip-path` variants (`torn`, `torn-b`, `torn-c`) rotate across the
grid so it never looks rubber-stamped. `paper-lift` pairs a `drop-shadow` with
a small translate on hover; `drop-shadow` is used rather than `box-shadow`
because a clipped element's box-shadow would still be drawn as a rectangle.

---

## ⚙️ Implementation Notes

- **🧮 Virtualization** — Editor Mode uses `react-window` v2's `Grid`; only
  visible cells mount, so 480 assets (or 48,000) scroll at the same cost.
- **📏 Measurement** — the grid viewport is measured in a **ref callback**,
  not a `useEffect` + ResizeObserver. The callback runs synchronously on
  attach, so the first paint already has real dimensions; the observer only
  handles later resizes. It measures a padding-free node, because
  `getBoundingClientRect()` includes padding and an over-reported width clips
  the last column.
- **🧷 Selection spacer** — while the bulk bar is up, the grid renders one
  extra blank row so the last real row can be scrolled clear of the overlay —
  cheaper than resizing the scroll viewport on every selection change.
- **🎞️ Motion** is transform/opacity only and fully disabled under
  `prefers-reduced-motion`. The download ring is a CSS `stroke-dashoffset`
  animation; the mode toggle is a single translating thumb.
- **♿ Accessibility** — inactive carousel slides use `inert` rather than
  `aria-hidden`, so their buttons are genuinely unfocusable instead of being
  focusable-but-hidden.

---

## 🧪 Mock-Data Caveats

> [!NOTE]
> `src/data/assets.js` generates everything from a seeded PRNG — **no backend.**

- **No real media files** — thumbnails are `picsum.photos` stills, so the
  reel's "autoplay muted preview" is a slow scale on the active slide, and
  `PreviewPlayer`'s scrub bar animates a simulated timeline via `rAF`. The
  play/pause/seek interactions are fully wired and would transfer to a real
  `<video>`, but nothing is decoding video today.
- **Downloads, `.zip` bundling, and share are UI-only** — `DownloadButton`
  just runs its animation and increments the streak counter.
- **Metadata is internally consistent** (only PNG/WebM carry alpha, stills
  have no duration or audio) so the filters return sensible results.

---

<p align="center">
  <sub>Built with React, Vite, and Tailwind CSS v4 · 480 mock assets, 0 backend calls</sub>
</p>
