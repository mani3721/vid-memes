import { useCallback, useMemo, useState } from 'react'
import { Grid } from 'react-window'
import { CheckSquare, SlidersHorizontal, TrendingUp, X } from 'lucide-react'
import { compact } from '../data/assets'
import { useTrendingMemes } from '../hooks/useMemes'
import { useStudio } from '../store/studioStore'
import AssetCard from './AssetCard'
import BulkDownloadBar from './BulkDownloadBar'
import FilterPanel from './FilterPanel'
import ProjectKits from './ProjectKits'

const INITIAL_FILTERS = {
  formats: [],
  aspects: [],
  licenses: [],
  alphaOnly: false,
  greenOnly: false,
  soundOnly: false,
  maxDuration: 30,
}

/* Fixed height of a card's text block below its square thumbnail: title +
 * wrapped metadata chips + scrub bar + action row + padding. Generous on
 * purpose — a row height a few pixels short clips the title rather than just
 * leaving a gap. */
const CONTENT_HEIGHT = 182

/** Column count from container width — mirrors a responsive CSS grid. */
function columnsFor(width) {
  if (width < 520) return 2
  if (width < 800) return 3
  if (width < 1150) return 4
  if (width < 1500) return 5
  return 6
}

/** Rendered by react-window for each visible cell only. */
function Cell({ columnIndex, rowIndex, style, items, columnCount, selected, onToggle, onStar }) {
  const index = rowIndex * columnCount + columnIndex
  const asset = items[index]
  if (!asset) return null

  return (
    <div style={style}>
      <div className="h-full p-1.5">
        <AssetCard
          asset={asset}
          selected={selected.has(asset.id)}
          onToggle={onToggle}
          onStar={onStar}
        />
      </div>
    </div>
  )
}

export default function EditorModeLayout() {
  const { selected, toggleSelect, clearSelection, selectMany, query, kits, addToKit } = useStudio()
  const { memes: allMemes } = useTrendingMemes({ limit: 200 })
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [size, setSize] = useState({ width: 0, height: 0 })

  /*
   * Measure the grid viewport so react-window can virtualize against it.
   * A ref callback measures synchronously the moment the node attaches, so the
   * first paint already has real dimensions — waiting on the ResizeObserver's
   * first async callback would leave the grid blank for a frame (and never
   * resolve at all in environments that don't drive RO callbacks). The observer
   * then handles every subsequent resize.
   */
  const measureRef = useCallback((el) => {
    if (!el) return undefined

    const apply = () => {
      const { width, height } = el.getBoundingClientRect()
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      )
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const editorPicks = useMemo(
    () => [...allMemes].sort((a, b) => b.editorUses - a.editorUses).slice(0, 10),
    [allMemes],
  )

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allMemes.filter((a) => {
      if (filters.formats.length && !filters.formats.includes(a.format)) return false
      if (filters.licenses.length && !filters.licenses.includes(a.license)) return false
      if (filters.alphaOnly && !a.hasAlpha) return false
      if (filters.greenOnly && !a.greenScreen) return false
      if (q && !a.title.toLowerCase().includes(q)) return false
      return true
    })
  }, [allMemes, filters, query])

  const columnCount = columnsFor(size.width || 1200)
  // One blank trailing row while the bulk bar is up, so the last real row can
  // still be scrolled clear of it. Cheaper than resizing the scroll viewport,
  // which would force a re-measure on every selection change.
  const spacerRows = selected.size > 0 ? 1 : 0
  const rowCount = Math.ceil(items.length / columnCount) + spacerRows
  const cellWidth = (size.width || 1200) / columnCount
  // card = square thumb (cellWidth - padding) + text block; row adds the padding back
  const rowHeight = Math.round(cellWidth + CONTENT_HEIGHT)

  const onStar = useCallback(
    (asset) => {
      const kit = kits[0]
      if (kit) addToKit(kit.id, [asset.id])
    },
    [kits, addToKit],
  )

  const cellProps = useMemo(
    () => ({ items, columnCount, selected, onToggle: toggleSelect, onStar }),
    [items, columnCount, selected, toggleSelect, onStar],
  )

  const totalMB = useMemo(
    () =>
      allMemes.filter((a) => selected.has(a.id))
        .reduce((sum, a) => sum + Number(a.sizeMB), 0)
        .toFixed(1),
    [allMemes, selected],
  )

  const saveSelectionToKit = () => {
    const kit = kits[0]
    if (kit) addToKit(kit.id, [...selected])
    clearSelection()
  }

  return (
    <div className="flex h-[calc(100dvh-var(--spacing-nav))] overflow-hidden">
      {/* Filter rail — off-canvas below lg */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-30 bg-canvas/70 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        aria-label="Asset filters"
        className={`fixed bottom-0 left-0 top-nav z-30 flex w-72 flex-col gap-4 overflow-y-auto border-r border-edge bg-canvas p-4 transition-transform duration-200 ease-out lg:static lg:z-0 lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <span className="font-display text-base tracking-wide">FILTERS</span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filters"
            className="grid size-8 place-items-center rounded-full text-mid hover:bg-white/10 hover:text-hi"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onReset={() => setFilters(INITIAL_FILTERS)}
            resultCount={items.length}
          />
        </div>

        <ProjectKits />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-edge px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs font-semibold text-hi lg:hidden"
            >
              <SlidersHorizontal className="size-3.5" />
              Filters
            </button>

            <h1 className="font-display text-xl tracking-wide text-hi">Meme Assets for Video Editors</h1>
            <span className="text-xs text-mid">{items.length} assets</span>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectMany(items.slice(0, 50).map((a) => a.id))}
                className="inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs font-semibold text-mid transition-colors duration-150 hover:border-brand hover:text-hi"
              >
                <CheckSquare className="size-3.5" />
                Select first 50
              </button>
            </div>
          </div>

          {/* Craft-side social proof, ranked by editor usage rather than views */}
          <div className="mt-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-brand" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-mid">
                Most used this week by editors
              </h2>
            </div>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {editorPicks.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleSelect(a.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors duration-150 ${
                    selected.has(a.id)
                      ? 'border-brand bg-brand/10'
                      : 'border-edge hover:border-mist/50'
                  }`}
                >
                  <img
                    src={a.thumb}
                    alt=""
                    loading="lazy"
                    className="size-8 shrink-0 rounded object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block max-w-36 truncate text-[11px] font-semibold text-hi">
                      {a.title}
                    </span>
                    <span className="block text-[10px] text-mid">
                      {compact(a.editorUses)} uses
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Virtualized grid — only visible cells mount */}
        <div className="min-h-0 flex-1 px-1 pb-1 sm:px-2">
          {items.length === 0 ? (
            <p className="pt-16 text-center text-sm text-mid">
              No assets match these filters. Try resetting a facet.
            </p>
          ) : (
            <div ref={measureRef} className="size-full">
              {size.width > 0 && (
                <Grid
                  cellComponent={Cell}
                  cellProps={cellProps}
                  columnCount={columnCount}
                  columnWidth={`${100 / columnCount}%`}
                  rowCount={rowCount}
                  rowHeight={rowHeight}
                  overscanCount={2}
                  className="scrollbar-thin"
                  style={{ height: size.height, width: size.width }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <BulkDownloadBar
        count={selected.size}
        totalMB={totalMB}
        onClear={clearSelection}
        onSaveToKit={saveSelectionToKit}
      />
    </div>
  )
}
