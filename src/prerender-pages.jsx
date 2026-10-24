/* eslint-disable react-refresh/only-export-components -- Build-time renderer, not a Fast Refresh entry. */
// Loaded only by Vite's build-time module loader, never by the client entry.
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import DmcaPage from './pages/DmcaPage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import DisclaimerPage from './pages/DisclaimerPage'
import HomeContentDepth from './components/HomeContentDepth'
import CategoryGuide from './components/CategoryGuide'
import SEO from './components/SEO'
import { CATEGORY_GUIDES } from './data/categoryGuides'
import { BASE_URL, toMemeUrl } from './utils/seo'

/** Links per hub. Enough to open a crawl path without burying the guide copy. */
const INDEX_SIZE = 24

/**
 * Guide key → published rows that belong on that hub.
 *
 * The database stores four categories (videos/gifs/images/sounds) while the
 * guides are keyed by route, so "templates" maps to images and "trending" is a
 * cross-category view rather than a stored value.
 */
const HUB_FILTERS = {
  trending: () => true,
  gifs: (asset) => asset.category === 'gifs',
  sounds: (asset) => asset.category === 'sounds',
  templates: (asset) => asset.category === 'images',
}

const pages = [
  ['/', Home],
  ['/about', AboutPage], ['/about-us', AboutPage],
  ['/contact', ContactPage], ['/contact-us', ContactPage],
  ['/privacy-policy', PrivacyPage], ['/privacy', PrivacyPage],
  ['/terms-of-use', TermsPage], ['/terms', TermsPage], ['/terms-and-conditions', TermsPage],
  ['/dmca-policy', DmcaPage], ['/content-policy', DmcaPage],
  ['/cookie-policy', CookiePolicyPage],
  ['/platform-disclaimer', DisclaimerPage], ['/disclaimer', DisclaimerPage],
]
const categories = [
  ['/trending-memes', 'trending', '/trending'], ['/trending', 'trending', '/trending'],
  ['/animated-gifs', 'gifs', '/gifs'], ['/gifs', 'gifs', '/gifs'],
  ['/sound-effects', 'sounds', '/sounds'], ['/sounds', 'sounds', '/sounds'],
  ['/meme-templates', 'templates', '/templates'], ['/templates', 'templates', '/templates'],
]

function Home() {
  return <><SEO title="Digital Media Archive and Creative Utility Database" /><main><h1>Videsaur Digital Media Archive and Creative Utility Database</h1><HomeContentDepth /></main></>
}

function Navigation() {
  return <nav aria-label="Site pages"><ul>{[
    ['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact'],
    ['/privacy-policy', 'Privacy Policy'], ['/terms-of-use', 'Terms of Use'],
    ['/dmca-policy', 'DMCA Policy'], ['/cookie-policy', 'Cookie Policy'],
    ['/platform-disclaimer', 'Platform Disclaimer'],
    ...categories.filter(([route]) => ['/trending-memes', '/animated-gifs', '/sound-effects', '/meme-templates'].includes(route))
      .map(([route, category]) => [route, CATEGORY_GUIDES[category].title]),
  ].map(([route, title]) => <li key={route}><a href={route}>{title}</a></li>)}</ul></nav>
}

/**
 * Crawlable link index below the guide copy.
 *
 * Without this the hubs are a crawl dead-end: a bot arriving from the homepage
 * finds guide prose, four sibling hub links, and no route into the ~480 asset
 * profiles, which are otherwise reachable only through the sitemap.
 *
 * Renders nothing when the catalog is unavailable, so a credential-less build
 * still produces a valid hub rather than an empty "Browse" heading.
 */
function DiscoveryIndex({ title, assets }) {
  if (!assets.length) return null
  return (
    <section className="crawler-discovery-index mt-12 border-t border-edge pt-8" aria-labelledby="discovery-index-heading">
      <h2 id="discovery-index-heading" className="mb-2 text-lg font-semibold text-hi">
        {title} — archived profile directory
      </h2>
      <p className="mb-6 text-sm text-lo">
        Each entry below opens a reference profile covering format details, editing
        guidance, and licensing notes for that individual file:
      </p>
      <ul className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
        {assets.map((asset) => (
          <li key={asset.id} className="rounded border border-edge/60 p-2 text-sm">
            <a href={`${BASE_URL}${toMemeUrl(asset)}`} className="font-medium tracking-tight text-brand">
              View transformative profile for: {asset.title?.trim() || 'Untitled meme reference element'} ({asset.format || 'Media'})
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function renderPages(catalog = []) {
  const entries = pages.map(([route, Component]) => [route, createElement(Component)])
  for (const [route, category, canonicalPath] of categories) {
    const guide = CATEGORY_GUIDES[category]
    const assets = catalog.filter(HUB_FILTERS[category] ?? (() => false)).slice(0, INDEX_SIZE)
    entries.push([route, <><SEO title={guide.title} description={guide.sections[0][1]} canonicalPath={canonicalPath} /><main><h1>{guide.title}</h1><CategoryGuide category={category} /><p>Live previews and filters are available when the interactive catalog loads.</p><DiscoveryIndex title={guide.title} assets={assets} /></main></>])
  }
  return entries.map(([route, content]) => ({
    route,
    html: renderToStaticMarkup(<StaticRouter location={route}>{content}<Navigation /></StaticRouter>),
  }))
}
