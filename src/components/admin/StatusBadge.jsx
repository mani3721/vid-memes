/** Colour-coded content_status pill. Shared by the content table and the editor. */
const STYLES = {
  published: 'bg-emerald-500/15 text-emerald-400',
  draft: 'bg-status-info/15 text-status-info',
  flagged: 'bg-status-hot/15 text-status-hot',
  removed: 'bg-red-500/15 text-red-400',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        STYLES[status] ?? 'bg-panel-hover text-mid'
      }`}
    >
      {status ?? 'unknown'}
    </span>
  )
}
