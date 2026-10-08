import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    heading: 'Explore',
    links: [
      ['Trending', '/trending'],
      ['Videos', '/videos'],
      ['GIFs', '/gifs'],
      ['Templates', '/templates'],
      ['Sounds', '/sounds'],
    ],
  },
  {
    heading: 'Quick Links',
    links: [
      ['About Us', '/about'],
      ['Contact Us', '/contact'],
    ],
  },
  {
    heading: 'Legal',
    links: [
      ['Privacy Policy', '/privacy'],
      ['Terms & Conditions', '/terms'],
      ['Disclaimer', '/disclaimer'],
    ],
  },
  {
    heading: 'Policies',
    links: [
      ['DMCA Policy', '/content-policy'],
      ['Cookie Policy', '/cookie-policy'],
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-panel">
      {/* content-visibility defers layout/paint until this scrolls near the
          viewport; contain-intrinsic-size keeps scrollbar height stable
          before that first measurement happens. */}
      <div className="mx-auto max-w-7xl px-6 py-12 [content-visibility:auto] [contain-intrinsic-size:auto_420px]">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {SECTIONS.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="mb-4 text-sm font-semibold text-hi">{heading}</h3>
              <ul className="space-y-2.5">
                {links.map(([label, to]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-mid transition-colors hover:text-hi"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 text-sm font-semibold text-hi">Contact</h3>
            <a
              href="mailto:support@videsaur.com"
              className="text-sm text-mid transition-colors hover:text-hi"
            >
              support@videsaur.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-edge">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 sm:flex-row">
          <span className="text-xs text-lo">
            © {new Date().getFullYear()} Videsaur. All rights reserved.
          </span>
          <span className="text-xs text-lo">Made with ♥ for video lovers worldwide</span>
        </div>
      </div>
    </footer>
  )
}
