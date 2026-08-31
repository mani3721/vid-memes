import { useState } from 'react'
import {
  Home,
  TrendingUp,
  Smile,
  AudioLines,
  LayoutGrid,
  Heart,
  ShieldCheck,
  Info,
  Mail,
  Lock,
  FileText,
  AlertTriangle,
  Cookie,
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/authContext'

const NAV_ITEMS = [
  { icon: Home,       label: 'Home',      to: '/'          },
  { icon: TrendingUp, label: 'Trending',  to: '/trending'  },
  { icon: Smile,      label: 'GIFs',      to: '/gifs'      },
  { icon: AudioLines, label: 'Music',     to: '/sounds'    },
  { icon: LayoutGrid, label: 'Templates', to: '/templates' },
  { icon: Sparkles,   label: 'AI Voice',  to: '/ai-sound', isNew: true },
]

const YOU_ITEMS = [
  { icon: Heart, label: 'Favorites', to: '/favorites' },
]

const RESOURCE_ITEMS = [
  { icon: Info,          label: 'About Us',          to: '/about'          },
  { icon: Mail,          label: 'Contact Us',         to: '/contact'        },
  { icon: Lock,          label: 'Privacy Policy',     to: '/privacy'        },
  { icon: FileText,      label: 'Terms & Conditions', to: '/terms'          },
  { icon: AlertTriangle, label: 'Disclaimer',         to: '/disclaimer'     },
  { icon: ShieldCheck,   label: 'DMCA Policy',        to: '/content-policy' },
  { icon: Cookie,        label: 'Cookie Policy',      to: '/cookie-policy'  },
  { icon: HelpCircle,    label: 'Help & Support',     to: '/help'           },
]

/* Active nav: left accent bar + panel-hover bg. Inactive: ghost on hover. */
function navClass(isActive) {
  return [
    'mb-0.5 flex items-center gap-3 rounded-r-lg border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors duration-150',
    isActive
      ? 'border-brand bg-panel-hover text-hi'
      : 'border-transparent text-mid hover:bg-panel-hover hover:text-hi',
  ].join(' ')
}

function resourceClass(isActive) {
  return [
    'mb-0.5 flex items-center gap-3 rounded-r-lg border-l-[3px] px-3 py-2 text-xs font-medium transition-colors duration-150',
    isActive
      ? 'border-brand bg-panel-hover text-hi'
      : 'border-transparent text-lo hover:bg-panel-hover hover:text-mid',
  ].join(' ')
}

/**
 * Positioned below the fixed Header (top-16 = 4rem).
 * Desktop (lg+): fixed full sidebar, always visible.
 * Tablet (md–lg): icon-only rail (w-16), expandable via toggle.
 * Mobile (<md): off-canvas drawer, triggered by Header hamburger.
 */
export default function Sidebar({ open, onClose }) {
  const [tabletExpanded, setTabletExpanded] = useState(false)
  const { isAdmin } = useAuth()

  const fullView = open || tabletExpanded

  return (
    <>
      {/* Mobile backdrop — covers content area below the header */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        aria-label="Site navigation"
        className={[
          /* Starts below the fixed header */
          'fixed left-0 top-16 z-40',
          'h-[calc(100vh-4rem)] overflow-y-auto',
          'border-r border-edge bg-panel',
          'flex flex-col',
          'transition-all duration-200',
          /* Width breakpoints */
          'w-65',
          tabletExpanded ? 'md:w-65' : 'md:w-16',
          'lg:w-65',
          /* Mobile slide-in */
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Tablet expand/collapse toggle + mobile close — hidden on desktop */}
        <div className="flex items-center justify-end px-3 py-2 lg:hidden">
          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-8 place-items-center rounded-full text-mid hover:bg-panel-hover hover:text-hi md:hidden"
          >
            <X className="size-4" />
          </button>
          {/* Tablet collapse toggle */}
          <button
            type="button"
            onClick={() => setTabletExpanded((v) => !v)}
            aria-label={tabletExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="hidden size-8 place-items-center rounded-full text-mid hover:bg-panel-hover hover:text-hi md:grid lg:hidden"
          >
            {tabletExpanded ? (
              <ChevronLeft className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        </div>

        {/* ── Main nav ─────────────────────────────────────── */}
        <nav aria-label="Main" className="px-2 pt-1">
          {NAV_ITEMS.map(({ icon: Icon, label, to, isNew }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              className={({ isActive }) => navClass(isActive)}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className={`truncate ${fullView ? '' : 'hidden lg:block'}`}>{label}</span>
              {isNew && (
                <span className={`ml-auto shrink-0 rounded-full bg-brand/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-brand ${fullView ? '' : 'hidden lg:inline'}`}>
                  New
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-4 my-3 border-t border-edge" />

        {/* ── You section ──────────────────────────────────── */}
        <div className={`px-2 ${fullView ? '' : 'hidden lg:block'}`}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-lo">
            You
          </p>
          {YOU_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => navClass(isActive && to !== '#')}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => navClass(isActive)}
            >
              <ShieldCheck className="size-4.5 shrink-0" />
              <span className="truncate">Admin Dashboard</span>
            </NavLink>
          )}
        </div>

        {/* You — icon-only (tablet collapsed) */}
        <div className={`px-2 ${fullView ? 'hidden' : 'block lg:hidden'}`}>
          {YOU_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={label}
              to={to}
              title={label}
              className={({ isActive }) =>
                `mb-0.5 flex w-full items-center justify-center rounded-lg py-2.5 text-sm transition-colors duration-150 ${
                  isActive && to !== '#'
                    ? 'bg-panel-hover text-brand'
                    : 'text-mid hover:bg-panel-hover hover:text-hi'
                }`
              }
            >
              <Icon className="size-4.5" />
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              title="Admin Dashboard"
              className={({ isActive }) =>
                `mb-0.5 flex w-full items-center justify-center rounded-lg py-2.5 text-sm transition-colors duration-150 ${
                  isActive ? 'bg-panel-hover text-brand' : 'text-mid hover:bg-panel-hover hover:text-hi'
                }`
              }
            >
              <ShieldCheck className="size-4.5" />
            </NavLink>
          )}
        </div>

        {/* ── Resources ────────────────────────────────────── */}
        <div className={`mt-4 px-2 ${fullView ? '' : 'hidden lg:block'}`}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-lo">
            Resources
          </p>
          {RESOURCE_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => resourceClass(isActive)}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* ── Tagline ──────────────────────────────────────── */}
        <div className={`mt-auto border-t border-edge px-4 py-4 ${fullView ? '' : 'hidden lg:block'}`}>
          <p className="text-[11px] leading-snug text-lo/60">
            Bite-sized content,<br />mega-sized laughs.
          </p>
        </div>
      </aside>
    </>
  )
}
