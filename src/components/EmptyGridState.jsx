/** Shown when a category grid has no items, or as a sparse-grid filler. */
export default function EmptyGridState({ category = 'content', message }) {
  const label = message ?? `No ${category} match that filter — try clearing your selection.`

  return (
    <div className="flex flex-col items-center gap-6 py-16">
      {/* Placeholder card skeletons */}
      <div className="grid w-full max-w-lg grid-cols-3 gap-3 opacity-30" aria-hidden>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-shimmer rounded-xl border border-edge bg-panel"
          />
        ))}
      </div>

      <p className="text-center text-sm text-lo">{label}</p>

      <p className="text-center text-xs text-lo/60">
        More {category} coming soon
      </p>
    </div>
  )
}
