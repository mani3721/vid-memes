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

export function renderPages() {
  const entries = pages.map(([route, Component]) => [route, createElement(Component)])
  for (const [route, category, canonicalPath] of categories) {
    const guide = CATEGORY_GUIDES[category]
    entries.push([route, <><SEO title={guide.title} description={guide.sections[0][1]} canonicalPath={canonicalPath} /><main><h1>{guide.title}</h1><CategoryGuide category={category} /><p>Live previews and filters are available when the interactive catalog loads.</p></main></>])
  }
  return entries.map(([route, content]) => ({
    route,
    html: renderToStaticMarkup(<StaticRouter location={route}>{content}<Navigation /></StaticRouter>),
  }))
}
