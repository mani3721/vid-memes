import { Link } from 'react-router-dom'

const LINKS = [
  ['Home', '/'],
  ['Trending', '/trending'],
  ['Videos', '/videos'],
  ['GIFs', '/gifs'],
  ['Templates', '/templates'],
  ['Sounds', '/sounds'],
  ['Privacy', '/privacy'],
  ['Terms', '/terms'],
  ['DMCA', '/content-policy'],
  ['Help', '/help'],
]

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-edge bg-panel/95 backdrop-blur-md md:left-16 lg:left-65">
      <div className="flex items-center gap-3 overflow-x-auto px-4 py-2.5 scrollbar-hide sm:px-6">
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-0.5">
          {LINKS.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className="whitespace-nowrap text-xs text-mid transition-colors hover:text-hi"
            >
              {label}
            </Link>
          ))}
        </div>
        <span className="ml-auto shrink-0 text-[11px] text-lo">
          © {new Date().getFullYear()} Videsaur
        </span>
      </div>
    </footer>
  )
}
