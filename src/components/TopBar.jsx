import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, X, User, LogOut, LogIn } from 'lucide-react'
import { useStudio } from '../store/studioStore'
import { useAuth } from '../lib/authContext'
import ThemeToggle from './ThemeToggle'

const ROUTE_LABELS = {
  '/':               'Home',
  '/trending':       'Trending',
  '/videos':         'Videos',
  '/gifs':           'GIFs',
  '/templates':      'Templates',
  '/sounds':         'Sounds',
  '/upload':         'Upload',
  '/about':          'About',
  '/contact':        'Contact',
  '/privacy':        'Privacy Policy',
  '/terms':          'Terms of Service',
  '/content-policy': 'DMCA Policy',
}

export default function TopBar({ onOpenSidebar }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { query, setQuery } = useStudio()
  const { user, profile, signOut } = useAuth()
  const inputRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const label = ROUTE_LABELS[pathname] ?? 'Browse'

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-edge bg-panel/95 px-4 py-3 backdrop-blur-md sm:px-6">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation menu"
        className="grid size-9 shrink-0 place-items-center rounded-full border border-edge bg-panel text-mid hover:bg-panel-hover hover:text-hi md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Current page label */}
      <span className="shrink-0 text-sm font-medium tracking-wide text-mid sm:text-sm">
        {label}
      </span>

      {/* Search */}
      <div className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-full border border-edge bg-panel px-4 py-2 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/15 sm:max-w-sm">
        <Search className="size-4 shrink-0 text-lo" />
        <label htmlFor="topbar-search" className="sr-only">Search memes</label>
        <input
          id="topbar-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memes, clips, sounds…"
          className="min-w-0 flex-1 bg-transparent text-sm text-hi placeholder:text-lo focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            aria-label="Clear search"
            className="grid size-5 shrink-0 place-items-center rounded-full text-lo transition-colors hover:text-hi"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Profile button */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-label="Profile menu"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-edge bg-panel text-sm font-semibold text-hi ring-brand/20 transition-colors hover:border-brand/40 hover:ring-2"
        >
          {user ? initials : <User className="size-4 text-mid" />}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-edge bg-panel shadow-xl">
            {user ? (
              <>
                <div className="border-b border-edge px-4 py-3">
                  <p className="text-xs text-lo">Signed in as</p>
                  <p className="truncate text-sm font-medium text-hi">
                    {profile?.display_name || user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => { await signOut(); setDropdownOpen(false) }}
                  className="flex w-full items-center gap-2 rounded-b-xl px-4 py-3 text-sm text-red-500 transition-colors hover:bg-panel-hover"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => { navigate('/login'); setDropdownOpen(false) }}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm text-hi transition-colors hover:bg-panel-hover"
              >
                <LogIn className="size-4" />
                Log in
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
