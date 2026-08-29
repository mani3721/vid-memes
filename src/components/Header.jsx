import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, X, User, LogOut, LogIn } from 'lucide-react'
import { useStudio } from '../store/studioStore'
import { useAuth } from '../lib/authContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

export default function Header({ onOpenSidebar }) {
  const navigate = useNavigate()
  const { query, setQuery } = useStudio()
  const { user, profile, signOut } = useAuth()
  const mobileInputRef = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Auto-focus mobile search input when expanded
  useEffect(() => {
    if (searchOpen) mobileInputRef.current?.focus()
  }, [searchOpen])

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-3 border-b border-edge bg-panel px-4 sm:px-6">

      {/* ── Left: hamburger (mobile) + Logo ─────────────────── */}
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          className="grid size-9 place-items-center rounded-full border border-edge bg-panel text-mid transition-colors hover:bg-panel-hover hover:text-hi md:hidden"
        >
          <Menu className="size-5" />
        </button>

        {/* Logo hidden on mobile when search is open */}
        <div className={searchOpen ? 'hidden sm:flex' : 'flex'}>
          <Logo />
        </div>
      </div>

      {/* ── Center: search bar (always flex-1) ───────────────── */}
      <div className="mx-2 flex flex-1 items-center sm:mx-6 lg:mx-10">

        {/* Desktop/tablet: always visible */}
        <div className="hidden w-full max-w-sm items-center gap-2 rounded-full border border-edge bg-canvas px-4 py-2 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/15 sm:flex lg:max-w-md">
          <Search className="size-4 shrink-0 text-lo" />
          <label htmlFor="header-search" className="sr-only">Search memes</label>
          <input
            id="header-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memes, clips, sounds…"
            className="min-w-0 flex-1 bg-transparent text-sm text-hi placeholder:text-lo focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="grid size-5 shrink-0 place-items-center rounded-full text-lo transition-colors hover:text-hi"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Mobile: expanded search input */}
        {searchOpen && (
          <div className="flex w-full items-center gap-2 rounded-full border border-edge bg-canvas px-4 py-2 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/15 sm:hidden">
            <Search className="size-4 shrink-0 text-lo" />
            <input
              ref={mobileInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="min-w-0 flex-1 bg-transparent text-sm text-hi placeholder:text-lo focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="grid size-5 shrink-0 place-items-center rounded-full text-lo transition-colors hover:text-hi"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Right: mobile search trigger + theme + avatar ─────── */}
      <div className="flex shrink-0 items-center gap-2">

        {/* Mobile search icon — hidden when expanded */}
        {!searchOpen && (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="grid size-9 place-items-center rounded-full border border-edge bg-panel text-mid transition-colors hover:bg-panel-hover hover:text-hi sm:hidden"
          >
            <Search className="size-4" />
          </button>
        )}

        <ThemeToggle />

        {/* Avatar / profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label="Profile menu"
            className="grid size-9 place-items-center rounded-full border border-edge bg-panel text-sm font-semibold text-hi transition-colors hover:border-brand/40 hover:ring-2 hover:ring-brand/20"
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
    </header>
  )
}
