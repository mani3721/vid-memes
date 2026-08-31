import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, X, User, LogOut, LogIn, Clock } from 'lucide-react'
import { useStudio } from '../store/studioStore'
import { useAuth } from '../lib/authContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useRecentSearches } from '../hooks/useRecentSearches'

export default function Header({ onOpenSidebar }) {
  const navigate = useNavigate()
  const { query, setQuery } = useStudio()
  const { user, profile, signOut } = useAuth()
  const { recents, add, remove, clear } = useRecentSearches()

  const mobileInputRef  = useRef(null)
  const dropdownRef     = useRef(null)
  const searchRef       = useRef(null)
  const mobileSearchRef = useRef(null)

  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false)

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Close recent-search dropdown when clicking outside the search bar
  useEffect(() => {
    function handle(e) {
      const inDesktop = searchRef.current?.contains(e.target)
      const inMobile  = mobileSearchRef.current?.contains(e.target)
      if (!inDesktop && !inMobile) {
        setSearchFocused(false)
        setMobileSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Auto-focus mobile search input when expanded
  useEffect(() => {
    if (searchOpen) mobileInputRef.current?.focus()
  }, [searchOpen])

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  function handleKeyDown(e, isMobile = false) {
    if (e.key === 'Enter' && query.trim()) {
      add(query.trim())
      isMobile ? setMobileSearchFocused(false) : setSearchFocused(false)
      e.target.blur()
    }
    if (e.key === 'Escape') {
      isMobile ? setMobileSearchFocused(false) : setSearchFocused(false)
      e.target.blur()
    }
  }

  function handleRecentClick(item) {
    setQuery(item)
    add(item)
    setSearchFocused(false)
    setMobileSearchFocused(false)
  }

  const filtered = query
    ? recents.filter((r) => r.toLowerCase().includes(query.toLowerCase()))
    : recents

  const showDesktopDropdown = searchFocused && filtered.length > 0
  const showMobileDropdown  = mobileSearchFocused && filtered.length > 0

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

        <div className={searchOpen ? 'hidden sm:flex' : 'flex'}>
          <Logo />
        </div>
      </div>

      {/* ── Center: search bar ────────────────────────────────── */}
      <div className="mx-2 flex flex-1 items-center sm:mx-6 lg:mx-10">

        {/* Desktop/tablet search */}
        <div ref={searchRef} className="relative hidden w-full max-w-sm sm:block lg:max-w-md">
          <div className="flex h-9 items-center gap-2 rounded-full border border-edge bg-canvas px-4 py-2 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/15">
            <Search className="size-4 shrink-0 text-lo" />
            <label htmlFor="header-search" className="sr-only">Search memes</label>
            <input
              id="header-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => handleKeyDown(e, false)}
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

          {/* Recent searches dropdown */}
          {showDesktopDropdown && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-edge bg-panel shadow-xl animate-rise">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-lo">Recent searches</p>
                <button
                  type="button"
                  onClick={clear}
                  className="text-[10px] text-lo transition-colors hover:text-brand"
                >
                  Clear all
                </button>
              </div>
              {filtered.map((item) => (
                <div key={item} className="group flex items-center gap-2.5 px-3 py-2 hover:bg-panel-hover">
                  <Clock className="size-3.5 shrink-0 text-lo" />
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleRecentClick(item) }}
                    className="min-w-0 flex-1 truncate text-left text-sm text-mid transition-colors group-hover:text-hi"
                  >
                    {item}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); remove(item) }}
                    aria-label={`Remove ${item}`}
                    className="grid size-5 shrink-0 place-items-center rounded-full text-lo opacity-0 transition-all hover:bg-panel hover:text-mid group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile: expanded search input */}
        {searchOpen && (
          <div ref={mobileSearchRef} className="relative w-full sm:hidden">
            <div className="flex items-center gap-2 rounded-full border border-edge bg-canvas px-4 py-2 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/15">
              <Search className="size-4 shrink-0 text-lo" />
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setMobileSearchFocused(true)}
                onKeyDown={(e) => handleKeyDown(e, true)}
                placeholder="Search…"
                className="min-w-0 flex-1 bg-transparent text-sm text-hi placeholder:text-lo focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setMobileSearchFocused(false) }}
                aria-label="Close search"
                className="grid size-5 shrink-0 place-items-center rounded-full text-lo transition-colors hover:text-hi"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Mobile recent searches dropdown */}
            {showMobileDropdown && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-edge bg-panel shadow-xl animate-rise">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-lo">Recent searches</p>
                  <button type="button" onClick={clear} className="text-[10px] text-lo hover:text-brand">Clear all</button>
                </div>
                {filtered.map((item) => (
                  <div key={item} className="group flex items-center gap-2.5 px-3 py-2 hover:bg-panel-hover">
                    <Clock className="size-3.5 shrink-0 text-lo" />
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleRecentClick(item) }}
                      className="min-w-0 flex-1 truncate text-left text-sm text-mid group-hover:text-hi"
                    >
                      {item}
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); remove(item) }}
                      className="grid size-5 shrink-0 place-items-center rounded-full text-lo opacity-0 group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: mobile search trigger + theme + avatar ─────── */}
      <div className="flex shrink-0 items-center gap-2">

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
