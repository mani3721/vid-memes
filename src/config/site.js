/** Single source of truth for anything a reviewer or crawler needs to see. */
export const SITE = {
  name: 'Videsaur',
  shortName: 'Videsaur',
  origin: 'https://videsaur.co.in',
  contactEmail: 'hello@videsaur.co.in',
  dmcaEmail: 'dmca@videsaur.co.in',
}

/**
 * AdSense publisher ID, supplied at build time as VITE_ADSENSE_CLIENT
 * (e.g. "ca-pub-1234567890123456"). Deliberately NOT hardcoded: shipping a
 * placeholder ID would make every ad request invalid and can get an account
 * flagged. When it is absent, AdSlot renders nothing in production.
 */
export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT ?? ''

export const FOOTER_NAV = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Content & DMCA Policy', to: '/content-policy' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
]
