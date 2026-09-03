import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle, ChevronLeft, ChevronRight, Loader2, Pencil, RefreshCw, Search, X,
} from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'
import { CONTENT_STATUSES } from '../../utils/contentSections'
import { bulkEditContent, listContent } from '../../lib/adminApi'
import StatusBadge from './StatusBadge'
import ContentEditForm from './ContentEditForm'

const CATEGORIES = ['videos', 'gifs', 'images', 'sounds']
const PAGE_SIZE = 25

/** The brief's target length, used to colour the per-row completeness figure. */
const TARGET_WORDS = 400

const controlClass =
  'rounded-xl border border-edge bg-canvas px-3 py-2 text-sm text-hi outline-none transition-colors focus:border-brand'

export default function ContentEditor() {
  const [filters, setFilters] = useState({
    q: '', category: '', status: '', needsDescription: false, missingDescription: false,
  })
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [editingId, setEditingId] = useState(null)
  const [bulkBusy, setBulkBusy] = useState(false)

  const [reloadToken, setReloadToken] = useState(0)

  const debouncedQuery = useDebounce(filters.q, 350)

  /**
   * Fetching lives entirely in this effect and only touches state from the
   * promise continuations. `loading` is switched on by the handlers that cause
   * a refetch instead — the user action is what starts the spinner, so the
   * effect never has to setState synchronously and cascade a re-render.
   */
  useEffect(() => {
    let active = true

    listContent({
      q: debouncedQuery,
      category: filters.category,
      status: filters.status,
      needsDescription: filters.needsDescription ? 'true' : '',
      missingDescription: filters.missingDescription ? 'true' : '',
      page,
      pageSize: PAGE_SIZE,
    })
      .then((result) => {
        if (!active) return
        setData(result)
        setError(null)
      })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [
    debouncedQuery, filters.category, filters.status,
    filters.needsDescription, filters.missingDescription, page, reloadToken,
  ])

  /** Every filter change resets to page 1 — an offset into the old result set is meaningless. */
  function setFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
    setLoading(true)
  }

  function goToPage(next) {
    setPage(next)
    setLoading(true)
  }

  const reload = useCallback(() => {
    setLoading(true)
    setReloadToken((t) => t + 1)
  }, [])

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const pageIds = data.items.map((i) => i.id)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allOnPageSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  async function applyBulk(patch) {
    setBulkBusy(true)
    setError(null)
    try {
      await bulkEditContent({ ids: [...selected], ...patch })
      setSelected(new Set())
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBulkBusy(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  return (
    <div className="space-y-4">
      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-lo" />
          <input
            type="search"
            placeholder="Search titles…"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            className={`${controlClass} w-full pl-9`}
          />
        </div>

        <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className={controlClass}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className={controlClass}>
          <option value="">All statuses</option>
          {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <button
          type="button"
          onClick={reload}
          className="grid size-9 place-items-center rounded-xl bg-panel-hover text-mid hover:text-hi"
          aria-label="Reload"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-mid">
        {/*
          Two distinct filters: "no long description" is a fact about the data,
          while "flagged for work" is an admin's judgement — the second is what
          bulk-edit sets, so backfill progress can be tracked separately from
          raw emptiness.
        */}
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={filters.missingDescription}
            onChange={(e) => setFilter('missingDescription', e.target.checked)}
            className="size-3.5 accent-brand"
          />
          No long description
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={filters.needsDescription}
            onChange={(e) => setFilter('needsDescription', e.target.checked)}
            className="size-3.5 accent-brand"
          />
          Flagged for description work
        </label>
        <span className="ml-auto">{data.total} item{data.total === 1 ? '' : 's'}</span>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Bulk action bar ──────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 p-3 text-sm">
          <span className="font-semibold text-hi">{selected.size} selected</span>

          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => applyBulk({ needs_description: true })}
            className="rounded-full bg-panel px-3 py-1 text-xs font-semibold text-hi hover:bg-panel-hover disabled:opacity-50"
          >
            Flag for description
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => applyBulk({ needs_description: false })}
            className="rounded-full bg-panel px-3 py-1 text-xs font-semibold text-hi hover:bg-panel-hover disabled:opacity-50"
          >
            Clear flag
          </button>

          <span className="mx-1 text-lo" aria-hidden>|</span>

          {CONTENT_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={bulkBusy}
              onClick={() => applyBulk({ content_status: status })}
              className="rounded-full bg-panel px-3 py-1 text-xs font-semibold capitalize text-hi hover:bg-panel-hover disabled:opacity-50"
            >
              Set {status}
            </button>
          ))}

          {bulkBusy && <Loader2 className="size-4 animate-spin text-brand" />}

          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto grid size-7 place-items-center rounded-full text-mid hover:text-hi"
            aria-label="Clear selection"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-2xl border border-edge">
        <table className="w-full min-w-184 border-collapse text-sm">
          <thead>
            <tr className="border-b border-edge bg-panel text-left text-xs uppercase tracking-wider text-mid">
              <th scope="col" className="w-10 p-3">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={togglePage}
                  aria-label="Select all on this page"
                  className="size-4 accent-brand"
                />
              </th>
              <th scope="col" className="p-3 font-semibold">Title</th>
              <th scope="col" className="p-3 font-semibold">Type</th>
              <th scope="col" className="p-3 font-semibold">Status</th>
              <th scope="col" className="p-3 font-semibold">Description</th>
              <th scope="col" className="p-3 font-semibold">Uploaded</th>
              <th scope="col" className="w-16 p-3" />
            </tr>
          </thead>
          <tbody>
            {loading && data.items.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center"><Loader2 className="mx-auto size-5 animate-spin text-brand" /></td></tr>
            ) : data.items.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center text-mid">Nothing matches these filters.</td></tr>
            ) : (
              data.items.map((row) => (
                <tr key={row.id} className="border-b border-edge/60 last:border-0 hover:bg-panel/60">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.title}`}
                      className="size-4 accent-brand"
                    />
                  </td>
                  <td className="max-w-64 p-3">
                    <div className="flex items-center gap-2">
                      {row.thumbnail_url && (
                        <img src={row.thumbnail_url} alt="" loading="lazy" className="size-9 shrink-0 rounded-lg object-cover" />
                      )}
                      <span className="truncate font-medium text-hi">{row.title}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-3 text-mid">{row.category} · {row.format}</td>
                  <td className="p-3"><StatusBadge status={row.content_status} /></td>
                  <td className="whitespace-nowrap p-3">
                    <span className={row.description_words >= TARGET_WORDS ? 'text-emerald-400' : row.description_words > 0 ? 'text-status-hot' : 'text-lo'}>
                      {row.description_words} w
                    </span>
                    {row.needs_description && (
                      <span className="ml-2 rounded-full bg-status-hot/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-status-hot">
                        todo
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap p-3 text-mid">{new Date(row.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => setEditingId(row.id)}
                      className="flex items-center gap-1 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/25"
                    >
                      <Pencil className="size-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="grid size-8 place-items-center rounded-full bg-panel-hover text-mid hover:text-hi disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-mid">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="grid size-8 place-items-center rounded-full bg-panel-hover text-mid hover:text-hi disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* ── Edit drawer ──────────────────────────────────────────────────── */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" role="dialog" aria-modal="true" aria-label="Edit content">
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-edge bg-panel p-5">
            <ContentEditForm
              key={editingId}
              memeId={editingId}
              onClose={() => setEditingId(null)}
              onSaved={reload}
            />
          </div>
        </div>
      )}
    </div>
  )
}
