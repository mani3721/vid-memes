# Videsaur — Pre-Launch Compliance Checklist

Use this checklist before submitting a Google AdSense application and before every major deployment.

---

## 1. Google AdSense Policy Requirements

### Content Quality
- [ ] All pages have unique, substantive content (no thin or placeholder pages)
      — **infrastructure done, copy outstanding.** Every meme page can carry a
      ~400-word description in five subsections (`memes.description_long`),
      written in Admin → Content Editor. Until a page has one it falls back to
      the templated one-liner and is genuinely thin. Track the backfill with the
      "No long description" filter and the per-row word count.
- [ ] Homepage has a descriptive H1, rich meta description, and at least 200 words of visible content
- [x] Meme pages use a real heading hierarchy — `h1` title, `h2` section, `h3` per subsection
- [x] Breadcrumb navigation visible on meme and blog pages, matching the BreadcrumbList JSON-LD
- [x] Each meme is a distinct crawlable URL (`/meme/{slug}-{id}`), never a modal or overlay
- [x] Blog posts exist as a separate content type for unique editorial copy and internal linking
- [ ] No adult, hateful, dangerous, or deceptive content
- [ ] No copyrighted content without licence (CC0 or transformative use only)
- [x] Content that is under DMCA/policy review is set to `flagged` or `removed`, which
      unpublishes the page and drops it from the sitemap without deleting the record

### Ad Placement

Adsterra scripts, URLs, native banners, and global placements have been removed.
`AdSlot` supports Google AdSense only; placement safety audits remain in place.
Run `node --test src/lib/astraAds.test.mjs` to check for reintroduced Adsterra loaders.
- [x] No ads within or immediately adjacent to MemeCard components (enforced by AdSlot context check)
- [x] Minimum 150 px gap between any ad and download buttons (`MIN_GAP_PX = 150` in AdSlot.jsx)
- [x] No ads in carousel/slideshow, sticky overlays, or pop-up modals
- [x] No ads adjacent to elements with `data-ad-unsafe` attribute (enforced by `auditPlacement()`)
- [x] All ad slots labelled "Advertisement" (emitted by `<AdSlot>` component unconditionally)
- [x] No fake download buttons that trigger ad clicks
- [ ] AdSense client ID supplied via `VITE_ADSENSE_CLIENT` environment variable (not hardcoded)

#### Where the slots are

| Page | Position | Context |
| --- | --- | --- |
| MemePage | Between "About This Meme" and "You Might Also Like" | `article` |
| MemePage | After the FAQ, before the footer | `pre-footer` |
| BlogPostPage | After the article body | `article` |
| BlogIndexPage | After the post list | `pre-footer` |

Every slot is an ordinary block element in the document flow. None is sticky,
floating, or interstitial.

#### The isolated download zone on MemePage

The detail page's download and share controls live alone in
`#isolated-download-control-zone`, at the foot of the right-hand column. No ad,
thumbnail, or navigation renders inside its bounds.

- `mt-40` (160px) separates it from the `AdReservation` box above it. The
  minimum asked for was 25-30px; 160px is used because `MIN_GAP_PX` is 150 and
  a 32px gap would make the slot above permanently unfillable — `auditPlacement()`
  would measure it, fail, and render nothing.
- `AdReservation` holds a fixed 250px box (a 300x250 medium rectangle) and the
  zone itself holds a fixed 190px envelope, so neither moves when the hero media
  or an async script settles. This is the CLS guarantee for the page's primary
  control.
- `AdReservation` is **reserved space, not a live slot.** It renders the dashed
  "Advertisement Slot" label in dev only; in production it is an inert sized
  div. Before replacing it with a real `<AdSlot context="sidebar">`, measure the
  audit with the unit mounted: `rectGap()` is radial, so it also measures the
  diagonal to the media hero in the left grid column, which is inside 150px. The
  hero is not marked `[data-ad-unsafe]` today, so the audit passes — confirm that
  is still true and still correct before going live.

The File Details card above now carries description text only; it holds no
clickable control at all.

#### Why each slot sits in its own wrapper `<div>`

`auditPlacement()` runs two checks. The geometric one — nothing marked
`[data-ad-unsafe]` within 150 px — is the substantive guarantee. The structural
one refuses to render if a *direct sibling* contains an ad-unsafe control, which
is a coarse proxy for "ad in the same row as a download button".

On a meme page every section is a sibling of the `<article>` that holds the
download button, so an unwrapped slot would trip the structural check and render
nothing. Giving each slot its own wrapper leaves it with no siblings to test,
and the 150 px geometric check then governs — satisfied by AdSlot's own `my-40`
(160 px) margin.

This is fail-safe in the right direction: if a layout change ever brings a
download button within 150 px, the audit blocks the ad rather than serving a
violation. The worst case is a missing ad, never a policy breach.

### Navigation & UX
- [ ] Site is fully navigable — no dead-end pages, no broken links
- [ ] All internal links use `<Link>` from react-router-dom (no full-page reloads)
- [ ] Mobile layout tested on 375 px viewport — no horizontal overflow, no hidden content

---

## 2. Legal & Trust Requirements

### Policy Pages (all at canonical URLs)
- [x] `/about` — AboutPage.jsx (who we are, what we offer)
- [x] `/contact` — ContactPage.jsx (email addresses, response times, contact form)
- [x] `/privacy` — PrivacyPage.jsx (GDPR Art. 15-22, CCPA 1798, AdSense data use, cookie table)
- [x] `/terms` — TermsPage.jsx (CC0 vs Editorial licences, acceptable use, DMCA, disclaimer)
- [x] `/content-policy` — DmcaPage.jsx (§ 512 procedure, counter-notice, repeat-infringer policy)

### Cookie Consent (GDPR / CCPA)
- [x] `<ConsentProvider>` wraps the entire app in `main.jsx`
- [x] `<CookieBanner>` shown when `!decided` (first visit, or after localStorage cleared)
- [x] Two choices: "Essential only" (rejectAll) and "Accept all" (acceptAll)
- [x] Default state is no consent — AdSense does not load until `adsAllowed === true`
- [x] Consent choice persisted in localStorage under `videsaur.consent.v1`
- [ ] Link to re-open cookie settings available in site footer (add a "Cookie settings" button)
- [ ] `ad_personalization` signal sent to Google on consent change (wire `gtag('consent', 'update', ...)`)

### Contact Information Visible
- [x] `hello@videsaur.co.in` shown on Contact page
- [x] `dmca@videsaur.co.in` shown on Contact and DMCA pages
- [ ] At least one email address visible in the site footer

---

## 3. Technical SEO & Crawlability

### Metadata
- [x] `<title>` and `<meta name="description">` on every page (via `<SEO>` component)
- [x] Canonical `<link rel="canonical">` on every page
- [x] Open Graph + Twitter Card tags in index.html
- [x] `robots.txt` at `/robots.txt` — allows Mediapartners-Google and AdsBot-Google
- [x] `sitemap.xml` at `/sitemap.xml` — a sitemap index generated live from the
      catalogue, split by content type and auto-paginated. See
      `server/docs/SITEMAP.md`
- [x] Sitemap URL referenced in robots.txt
- [x] Admin, auth and per-user pages excluded from the sitemap and `Disallow`ed
      in robots.txt (`/admin`, `/login`, `/upload`, `/favorites`, `/*?q=`)

### Structured Data
- [x] WebSite + SearchAction schema on homepage
- [x] FAQPage schema on homepage
- [x] VideoObject / ImageObject / AudioObject schema on individual meme pages
      (dispatched by format in `buildMediaSchema`)
- [x] BlogPosting schema on blog posts, Blog schema on the blog index
- [x] BreadcrumbList schema on individual meme pages
- [x] CollectionPage schema on category pages

### Performance
- [x] LCP image: `loading="eager"` + `fetchpriority="high"` on first MasonryFeed card and MemePage hero
- [x] Remaining images: `loading="lazy"`
- [x] Code-split via `React.lazy()` for all page-level components
- [ ] Core Web Vitals measured in PageSpeed Insights (target LCP < 2.5 s, CLS < 0.1, INP < 200 ms)

---

## 4. Build Pipeline & Local Pre-Submission Audit

### The chain

`package.json` runs three stages in order; any failure stops the chain:

```
vite build        → dist/ + dist/prerender-pages.json (rendered React page content)
node prerender.mjs → 23 structural pages + 481 asset pages injected into dist/
node audit-build.mjs → verifies dist/ is crawlable (run separately, or via npm run verify)
```

| Script | Does |
| --- | --- |
| `npm run build` | Vite compile, then prerender. This is what Vercel runs. |
| `npm run prerender` | Re-runs injection only. Idempotent — restores from `.prerender-template.html`. |
| `npm run audit` | Reads `dist/`, exits non-zero on failure. Changes nothing. |
| `npm run verify` | `build` then `audit`. Use before every resubmission. |

`audit` is deliberately **not** chained into `build`. Vercel builds without Supabase
credentials would skip asset pages, and a chained audit would fail the deploy over a
local-only check.

### What the audit proves — and what it does not

It reads `dist/` only. A green run means the built bundle is crawlable. It says
nothing about what the live origin serves — routing, redirects, and CDN behaviour
are verified in Search Console (section 5).

Per page it checks: word count of body text, exactly one non-empty `<title>`,
an `<h1>`, a canonical link, at least one `/assets/` reference, and no relative
`./assets/` paths. Plus: unique titles across core routes, the
`videsaur-asset-data-profile` container on every asset page, and the exact
`ads.txt` publisher record.

Two thresholds, because they answer different questions:

- `MIN_WORDS_*` — "did prerendering happen?" An unrendered shell is ~0 words. **Fails the build.**
- `THIN_CONTENT_WORDS` (250) — "would a reviewer call this thin?" **Warns only**, since a contact form is legitimately short.

The **prerender marker check is the load-bearing one.** `index.html` already ships
~885 words of homepage manifesto as a crawlable baseline, so word count alone cannot
distinguish a correct `/about` from a stale shell copied into `dist/about/` — both
look content-rich. Only the `<!-- videsaur-prerendered -->` marker proves
route-specific content was substituted.

Current state: 12 core routes, 481 asset pages, thinnest core page `/contact` at
140 words (advisory), thinnest asset page 565 words.

---

## 5. AdSense Application Prerequisites

Complete all items above, then:

- [ ] Set `VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX` in your production environment (Vercel / Netlify env vars)
- [ ] Deploy to production (AdSense reviewers must be able to crawl the live site)
- [ ] Verify site ownership in Google Search Console
- [ ] Submit sitemap in Google Search Console
- [ ] Apply for AdSense at https://www.google.com/adsense/start/
- [ ] After approval: add the AdSense verification `<script>` tag to index.html
- [ ] Test ad display in a logged-out browser to confirm ads appear correctly
- [ ] Confirm "Advertisement" label is visible above each ad unit

---

## 6. Ongoing Compliance (Post-Approval)

- [ ] Review AdSense policy updates quarterly
- [ ] Process all DMCA notices within 48 hours
- [ ] Verify cookie banner still renders after any ConsentProvider or localStorage key changes
- [ ] After adding a new static route, add it to `STATIC_PAGES` in
      `server/lib/sitemap/config.js` — static routes are code, not data, so the
      sitemap cannot discover them on its own
- [ ] After adding a new static route, also add it to `CORE_ROUTES` in
      `audit-build.mjs` and to `prerender.mjs` — otherwise the route ships
      unprerendered and unaudited
- [ ] Monitor AdSense account for policy violations in the AdSense dashboard

---

_Last reviewed: 2 September 2026_
