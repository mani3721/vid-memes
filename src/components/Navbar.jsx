import { useState } from 'react'
import { LogIn, LogOut, Upload, UserPlus, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import ModeToggle from './ModeToggle'
import SearchOverlay from './SearchOverlay'
import Logo from './Logo'
import { useAuth } from '../lib/authContext'

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, isAdmin, signOut, loading } = useAuth()

  return (
    <header className="sticky top-0 z-40 h-nav border-b border-edge bg-canvas/95 backdrop-blur-md">
      <div className="relative mx-auto flex h-full max-w-[1600px] items-center gap-3 px-3 sm:px-6">
        <Logo />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SearchOverlay
            open={searchOpen}
            onOpen={() => setSearchOpen(true)}
            onClose={() => setSearchOpen(false)}
          />
        </div>

        <ModeToggle />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/upload"
            className="hidden items-center gap-1.5 rounded-full border border-edge px-3.5 py-2 text-sm font-medium text-hi transition-colors duration-150 hover:border-neon hover:text-neon md:inline-flex"
          >
            <Upload className="size-4" />
            Upload
          </Link>

          {!loading && user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden items-center gap-1.5 rounded-full border border-brand/40 px-3 py-2 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand/10 sm:inline-flex"
                >
                  <ShieldCheck className="size-3.5" />
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="hidden flex-col items-end sm:flex">
                  <span className="max-w-30 truncate text-xs font-medium text-hi">{user.email}</span>
                  {isAdmin && <span className="text-[10px] text-brand">Admin</span>}
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  title="Sign out"
                  className="inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-2 text-sm font-medium text-mid transition-colors hover:border-red-500/60 hover:text-red-400"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </>
          ) : !loading ? (
            <>
              <Link
                to="/login?tab=signup"
                className="hidden items-center gap-1.5 rounded-full border border-edge px-3.5 py-2 text-sm font-medium text-hi transition-colors duration-150 hover:border-brand hover:text-brand sm:inline-flex"
              >
                <UserPlus className="size-4" />
                <span>Sign up</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-brand-2 sm:px-4"
              >
                <LogIn className="size-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
