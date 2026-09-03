import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * Visual breadcrumb trail.
 *
 * Takes the same `crumbs` array that buildBreadcrumbSchema turns into
 * BreadcrumbList JSON-LD, so what a reader sees and what a crawler parses can
 * never disagree. The last crumb is the current page and is not a link.
 *
 * @param {{ crumbs: {name: string, url?: string}[] }} props
 */
export default function Breadcrumbs({ crumbs }) {
  if (!crumbs?.length) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-mid">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1

          return (
            <li key={crumb.name} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight aria-hidden className="size-3 shrink-0 text-lo" />}
              {isLast || !crumb.url ? (
                // aria-current marks the current page for screen readers; the
                // title is already an <h1>, so this stays visually secondary.
                <span aria-current="page" className="truncate font-medium text-hi">
                  {crumb.name}
                </span>
              ) : (
                <Link to={crumb.url} className="shrink-0 transition-colors hover:text-brand">
                  {crumb.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
