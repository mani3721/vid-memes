/** Shared layout wrapper for all legal / policy pages. */
export default function PolicyLayout({ title, lastUpdated, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="mb-2 font-display text-3xl tracking-wide text-hi sm:text-4xl">
        {title.toUpperCase()}
      </h1>
      {lastUpdated && (
        <p className="mb-10 text-xs text-lo">Last updated: {lastUpdated}</p>
      )}

      <div className="space-y-12 text-sm leading-7 text-mid">
        {children}
      </div>
    </div>
  )
}

/** Reusable section block inside a policy page. */
export function PolicySection({ heading, children }) {
  return (
    <section>
      <h2 className="mb-4 border-b border-edge pb-2 font-display text-base tracking-wide text-hi sm:text-lg">
        {heading.toUpperCase()}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
