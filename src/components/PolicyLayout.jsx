/** Shared layout wrapper for all legal / policy pages. */
export default function PolicyLayout({ title, lastUpdated, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 font-display text-2xl tracking-wide text-hi sm:text-3xl">
        {title.toUpperCase()}
      </h1>
      {lastUpdated && (
        <p className="mb-8 text-xs text-mid">Last updated: {lastUpdated}</p>
      )}

      <div className="space-y-8 text-sm leading-relaxed text-mid">
        {children}
      </div>
    </div>
  )
}

/** Reusable section block inside a policy page. */
export function PolicySection({ heading, children }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-base tracking-wide text-hi">
        {heading.toUpperCase()}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
