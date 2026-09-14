import { useState } from 'react'
import { Folder, ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CollectionCard({ collection }) {
  const { id, name, emoji, itemCount, latestThumbnail } = collection
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const showImage = latestThumbnail && !imgError

  return (
    <Link
      to={`/favorites/collection/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-edge bg-panel transition-[border-color,box-shadow] hover:border-brand/50 hover:shadow-lg"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full overflow-hidden bg-panel-hover">

        {/* Shimmer while the image is in-flight */}
        {showImage && !imgLoaded && (
          <div aria-hidden className="absolute inset-0 animate-shimmer bg-panel-hover" />
        )}

        {showImage ? (
          <img
            src={latestThumbnail}
            alt=""
            aria-hidden
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`size-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-10 text-lo/40" />
          </div>
        )}

        {/* Gradient only at the bottom — doesn't swallow dark thumbnails */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/50 to-transparent" />

        {/* Item count badge */}
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {emoji ? (
          <span className="text-lg leading-none" aria-hidden>
            {emoji}
          </span>
        ) : (
          <Folder className="size-4 shrink-0 text-brand" />
        )}
        <p className="flex-1 truncate text-sm font-medium text-hi transition-colors group-hover:text-brand">
          {name}
        </p>
      </div>
    </Link>
  )
}
