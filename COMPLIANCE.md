# Videsaur — Pre-Launch Compliance Checklist

Use this checklist before submitting a Google AdSense application and before every major deployment.

---

## 1. Google AdSense Policy Requirements

### Content Quality
- [ ] All pages have unique, substantive content (no thin or placeholder pages)
- [ ] Homepage has a descriptive H1, rich meta description, and at least 200 words of visible content
- [ ] No adult, hateful, dangerous, or deceptive content
- [ ] No copyrighted content without licence (CC0 or transformative use only)

### Ad Placement
- [ ] No ads within or immediately adjacent to MemeCard components (enforced by AdSlot context check)
- [ ] Minimum 150 px gap between any ad and download buttons (`MIN_GAP_PX = 150` in AdSlot.jsx)
- [ ] No ads in carousel/slideshow, sticky overlays, or pop-up modals
- [ ] No ads adjacent to elements with `data-ad-unsafe` attribute (enforced by `auditPlacement()`)
- [ ] All ad slots labelled "Advertisement" (emitted by `<AdSlot>` component unconditionally)
- [ ] No fake download buttons that trigger ad clicks
- [ ] AdSense client ID supplied via `VITE_ADSENSE_CLIENT` environment variable (not hardcoded)

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
- [x] `sitemap.xml` at `/sitemap.xml` — 11 static + 480 meme pages
- [x] Sitemap URL referenced in robots.txt

### Structured Data
- [x] WebSite + SearchAction schema on homepage
- [x] FAQPage schema on homepage
- [x] VideoObject / ImageObject schema on individual meme pages
- [x] BreadcrumbList schema on individual meme pages
- [x] CollectionPage schema on category pages

### Performance
- [x] LCP image: `loading="eager"` + `fetchpriority="high"` on first MasonryFeed card and MemePage hero
- [x] Remaining images: `loading="lazy"`
- [x] Code-split via `React.lazy()` for all page-level components
- [ ] Core Web Vitals measured in PageSpeed Insights (target LCP < 2.5 s, CLS < 0.1, INP < 200 ms)

---

## 4. AdSense Application Prerequisites

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

## 5. Ongoing Compliance (Post-Approval)

- [ ] Review AdSense policy updates quarterly
- [ ] Process all DMCA notices within 48 hours
- [ ] Verify cookie banner still renders after any ConsentProvider or localStorage key changes
- [ ] Re-run sitemap generator (`npm run sitemap`) after adding new pages
- [ ] Monitor AdSense account for policy violations in the AdSense dashboard

---

_Last reviewed: 27 August 2026_
