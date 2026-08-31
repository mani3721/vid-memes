import { NavLink } from 'react-router-dom'
import { Search, TrendingUp } from 'lucide-react'

const PILL = 'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150'
const ACTIVE = 'bg-brand text-ink'
const IDLE = 'border border-edge text-mid hover:border-brand/40 hover:text-hi'

export default function FeedToggle() {
  return (
    <div className="flex gap-2">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${PILL} ${isActive ? ACTIVE : IDLE}`}
      >
        <Search className="size-3.5" />
        Browse
      </NavLink>
      <NavLink
        to="/trending"
        className={({ isActive }) => `${PILL} ${isActive ? ACTIVE : IDLE}`}
      >
        <TrendingUp className="size-3.5" />
        Trending
      </NavLink>
    </div>
  )
}
