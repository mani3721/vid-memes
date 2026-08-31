import { useState } from 'react'
import { Check, Code2, Link2, Star } from 'lucide-react'
import { compact, formatDuration } from '../data/assets'
import DownloadButton from './DownloadButton'
import PreviewPlayer from './PreviewPlayer'

/** Editor-app compatibility, derived from the asset's actual properties. */
function compatibility(asset) {
  const tags = []
  if (asset.hasAlpha) tags.push('Has Alpha Channel')
  if (asset.format === 'MP4' || asset.format === 'PNG') tags.push('Premiere Ready')
  if (asset.aspect === '9:16' || asset.format === 'MP4') tags.push('CapCut Ready')
  return tags
}

function Meta({ children }) {
  return (
    <span className="rounded border border-edge px-1.5 py-0.5 text-[10px] font-medium text-mid">
      {children}
    </span>
  )
}

/** Dense library card: metadata visible up front, batch-select, quick-copy. */
export default function AssetCard({ asset, selected, onToggle, onStar }) {
  const [copied, setCopied] = useState(null)

  const copy = async (kind, text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard blocked (insecure origin / denied) — still show feedback so
      // the button never looks dead.
    }
    setCopied(kind)
    setTimeout(() => setCopied(null), 1400)
  }

  const link = `https://memestudio.app/a/${asset.id}.${asset.format.toLowerCase()}`
  const embed = `<video src="${link}" autoplay muted loop playsinline></video>`

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border bg-panel transition-colors duration-150 ${
        selected ? 'border-brand' : 'border-edge hover:border-mist/40'
      }`}
    >
      <div className="relative aspect-square shrink-0 overflow-hidden bg-panel-hover">
        <img
          src={asset.thumb}
          alt={asset.title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />

        <label className="absolute left-2 top-2 flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(asset.id)}
            aria-label={`Select ${asset.title}`}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={`grid size-6 place-items-center rounded-md border-2 backdrop-blur-sm transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand ${
              selected ? 'border-brand bg-brand text-ink' : 'border-white/70 bg-canvas/50'
            }`}
          >
            {selected && <Check className="size-4" strokeWidth={3} />}
          </span>
        </label>

        <button
          type="button"
          onClick={() => onStar(asset)}
          aria-label={`Save ${asset.title} to a Project Kit`}
          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-canvas/70 text-hi backdrop-blur-sm transition-colors duration-150 hover:bg-brand"
        >
          <Star className="size-3.5" />
        </button>

        <div className="absolute inset-x-2 bottom-2 flex flex-wrap gap-1">
          {asset.greenScreen && (
            <span className="rounded bg-[#00c853] px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">
              Green screen
            </span>
          )}
          {asset.hasAlpha && (
            <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-hi">
              Alpha
            </span>
          )}
        </div>

        {/* Compatibility surfaces on hover so the resting card stays scannable */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-1 bg-canvas/85 p-3 opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          {compatibility(asset).map((tag) => (
            <span key={tag} className="text-[11px] font-semibold text-hi">
              ✓ {tag}
            </span>
          ))}
          <span className="mt-1 text-[11px] text-mid">
            {compact(asset.editorUses)} editors used this
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2.5">
        <h3 className="line-clamp-1 shrink-0 text-[13px] font-semibold text-hi">{asset.title}</h3>

        <div className="flex shrink-0 flex-wrap gap-1">
          <Meta>{asset.format}</Meta>
          <Meta>{asset.resolution}</Meta>
          <Meta>{asset.aspect}</Meta>
          <Meta>{formatDuration(asset.duration)}</Meta>
          <Meta>{asset.sizeMB}MB</Meta>
          <Meta>{asset.license}</Meta>
        </div>

        <PreviewPlayer duration={asset.duration} compact />

        <div className="mt-auto flex shrink-0 items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => copy('link', link)}
            aria-label={`Copy direct link to ${asset.title}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-edge py-1.5 text-[11px] font-semibold text-mid transition-colors duration-150 hover:border-brand hover:text-hi"
          >
            <Link2 className="size-3" />
            {copied === 'link' ? 'Copied' : 'Link'}
          </button>
          <button
            type="button"
            onClick={() => copy('embed', embed)}
            aria-label={`Copy embed code for ${asset.title}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-edge py-1.5 text-[11px] font-semibold text-mid transition-colors duration-150 hover:border-brand hover:text-hi"
          >
            <Code2 className="size-3" />
            {copied === 'embed' ? 'Copied' : 'Embed'}
          </button>
          <DownloadButton label={`Download ${asset.title}`} size="sm" />
        </div>
      </div>
    </article>
  )
}
