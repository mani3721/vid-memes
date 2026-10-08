import { Link } from 'react-router-dom'

const FOOTER_COLUMNS = [
  {
    title: 'Asset Libraries',
    links: [
      ['Trending Memes', '/trending-memes'],
      ['Animated GIFs', '/gifs'],
      ['Sound Effects', '/sound-effects'],
      ['Meme Templates', '/meme-templates'],
    ],
  },
  {
    title: 'Privacy & Legal',
    links: [
      ['Privacy Policy', '/privacy-policy'],
      ['Terms of Use', '/terms-and-conditions'],
      ['DMCA Policy', '/dmca-policy'],
      ['Cookie Policy', '/cookie-policy'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Us', '/about-us'],
      ['Contact Us', '/contact-us'],
      ['Platform Disclaimer', '/disclaimer'],
    ],
  },
]

const linkStyle = {
  color: 'var(--text-secondary)',
  minHeight: '48px',
  minWidth: '48px',
}

export default function Footer() {
  return (
    <footer
      className="px-5 py-10 font-sans text-sm leading-[1.6] sm:px-8 lg:px-12"
      style={{
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-edge)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 text-center md:grid-cols-2 lg:grid-cols-4 lg:text-left">
        <section aria-labelledby="footer-platform-title">
          <h2
            id="footer-platform-title"
            className="mb-4 text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Videsaur
          </h2>
          <p className="m-0" style={{ color: 'var(--text-secondary)' }}>
            Videsaur is an open-access digital curation workshop providing
            high-performance media elements, short-form transitions, and lossless
            soundboards for digital media professionals and independent storytellers.
          </p>
        </section>

        {FOOTER_COLUMNS.map(({ title, links }) => {
          const headingId = `footer-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`

          return (
            <nav key={title} aria-labelledby={headingId}>
              <h2
                id={headingId}
                className="mb-3 font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h2>
              <ul className="m-0 flex list-none flex-col items-center gap-3 p-0 lg:items-start">
                {links.map(([label, to]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center justify-center font-medium no-underline transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:justify-start"
                      style={linkStyle}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )
        })}
      </div>

      <div
        className="mx-auto mt-10 max-w-7xl pt-6 text-center text-xs"
        style={{
          borderTop: '1px solid var(--border-edge)',
          color: 'var(--text-tertiary)',
        }}
      >
        <p className="m-0">
          © 2026 Videsaur. All rights reserved. Sourced pop-culture assets and community
          historical artifacts are curated and processed strictly inside transformative
          Fair Use boundaries.
        </p>
      </div>
    </footer>
  )
}
