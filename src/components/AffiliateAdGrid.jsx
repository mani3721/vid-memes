import { useState } from 'react'

/**
 * Field glossary:
 *   id          – stable key for React reconciliation
 *   title       – product display name
 *   category    – badge label
 *   description – short pitch shown in grid variant below the title
 *   buttonText  – CTA label on the buy button
 *   icon        – fallback emoji when imageUrl is absent or broken
 *   imageUrl    – product photo URL (right-click image on Amazon → Copy image address)
 *   priceString – formatted price, e.g. "from ₹1,893"
 *   badge       – optional corner label e.g. "Best Seller", "Hot Deal", "New" (omit to hide)
 *   rating      – optional star rating 0–5, e.g. 4.5
 *   reviewCount – optional review count string, e.g. "2,341"
 *   href        – Amazon Associates tracking link
 *   enabled     – false = hidden without deleting the entry
 */
const AFFILIATE_PRODUCTS = [
  {
    id: 'aff-001',
    title: 'Casio Vintage A-158WA-1Q Digital Grey Dial Unisex Watch Silver Metal Strap (D011)',
    category: 'Watch',
    description: 'Classic rectangular design with mineral glass, LED backlight, and water resistance — built to last.',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/61ybeKQto8L._SY879_.jpg',
    priceString: '₹1,893',
    badge: 'Best Seller',
    rating: 4.5,
    reviewCount: '82,480',
    href: 'https://link.amazon/B0c3SujOJ',
    enabled: true,
  },
   {
    id: 'aff-001',
    title: 'Allen Solly Men’s Polo T‑Shirt | Comfortable Rich Cotton Blend, Band Collar, Regular Fit | Stylish & Premium All Day Wear',
    category: 'T-Shirt',
    description: '60% cotton and 40% polyester, Regular fit, Banded collar,Half sleeve, Wash with mild detergent, do not bleach, dry in shade, Made in India',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/61yAbOVbQ6L._SY879_.jpg',
    priceString: '₹703',
    badge: 'Best Seller',
    rating: 4.1,
    reviewCount: '14,480',
    href: 'https://link.amazon/B01T7YgAp',
    enabled: true,
  },
     {
    id: 'aff-001',
    title: 'Campus Men Oxyfit (N) Walking Shoes',
    category: 'Shoes',
    description: 'Shoes Upper- Slip into style and ease with these mens casual slip-on shoes. The breathable mesh upper keeps your feet fresh and comfortable. These slip-ons are easy to wear and are perfect for those who hate the hassle of tying laces. Suitable for your need, be it college, office, or casual dates – these shoes for men are versatile enough for any occasion!',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/7198NljaZlL._SX695_.jpg',
    priceString: '₹699',
    badge: 'Best Seller',
    rating: 4.1,
    reviewCount: '27,480',
    href: 'https://link.amazon/B0boenk8t',
    enabled: true,
  },
     {
    id: 'aff-001',
    title: 'Safari Pentagon Pro 8 Wheels 55cm Cabin Size Trolley Bag, Hard Case Polypropylene, 360º Wheeling Small Carry-on Luggage, Suitcase for Travel, Trolley Bags for Travel, Luxury Beige',
    category: 'Luggage',
    description: 'Lightweight Luggage: Crafted from premium polypropylene for superior durability, this lightweight trolley bag is designed to withstand the rigors of modern travel.',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/612fPWuwemL._SL1500_.jpg',
    priceString: '₹1,499',
    badge: 'Best Seller',
    rating: 4.1,
    reviewCount: '22,480',
    href: 'https://link.amazon/B0bERDXlz',
    enabled: true,
  },
     {
    id: 'aff-001',
    title: 'Safari Omega spacious/large laptop backpack with Raincover, college bag, travel bag for men and women, Black, 30 Litre',
    category: 'Luggage',
    description: '2 spacious compartments with 2 front pockets and an organizer compartment.',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/71maWXZscfL._SL1500_.jpg',
    priceString: '₹709',
    badge: 'Best Seller',
    rating: 4.2,
    reviewCount: '17,480',
    href: 'https://link.amazon/B02drbLqd',
    enabled: true,
  },
   {
    id: 'aff-001',
    title: 'Simple Kind To Skin Refreshing Facial Wash 150 ml | 100% Soap-Free Facewash that doesnt dry out your skin| For All Skin Types',
    category: 'Beauty',
    description: '100% Soap-free, gentle cleanser',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/51wqZYWGr+L._SL1000_.jpg',
    priceString: '₹265',
    badge: 'Best Seller',
    rating: 4.2,
    reviewCount: '36,480',
    href: 'https://link.amazon/B0c1hObFz',
    enabled: true,
  },
    {
    id: 'aff-001',
    title: 'HP 15, AMD Ryzen 3 7320U (8GB LPDDR4, 512GB SSD) FHD, Micro-Edge, 15.6"/39.6cm, Win 11, M365 Basic(1yr), Office24, Silver, 1.59kg, fc0499AU, AMD Radeon Graphics, 1080p FHD Camera Laptop',
    category: 'Laptop',
    description: '【Processor, Memory & Storage】: AMD Ryzen 3 7320U (up to 4.1 GHz max boost clock, 4 MB L3 cache, 4 cores, 8 threads)| Memory: 8 GB DDR4-3200 MT/s (onboard)| Storage: 512 GB PCIe NVMe M.2 SSD',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/61kE1cvaHpL._SL1254_.jpg',
    priceString: '₹49,990',
    badge: 'Best Seller',
    rating: 4.2,
    reviewCount: '400',
    href: 'https://link.amazon/B05yqrYEK',
    enabled: true,
  },
      {
    id: 'aff-001',
    title: 'Hanumex® 8x12 Ft. Pro Green Screen Backdrop: Wrinkle-Free Fabric, Rod Pocket for Photo Studio, Live Stream, YouTube, VFX & More',
    category: 'Youtube',
    description: '【The green screen backdrop is foldable. Perfect studio Photography background for studio video and photo. Note: The Backdrop Stand is not included',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/41MrsJo5RrL._SL1500_.jpg',
    priceString: '₹549',
    badge: 'Best Seller',
    rating: 4.2,
    reviewCount: '6,670',
    href: 'https://link.amazon/B09DQXyED',
    enabled: true,
  },
       {
    id: 'aff-001',
    title: 'HIFFIN® Branded Mark I Umbrella White 80CM + Portable Foldable Umbrella Flash Photo Video Studio Lighting Photography Stand + Umbrella and Bulb Holder with Carry Bag',
    category: 'Youtube',
    description: 'Photography Light Stands is a perfect stand both for studio and on-site use',
    buttonText: 'Shop on Amazon',
    icon: '⌚',
    imageUrl: 'https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/51IKKZ+VFhS._SL1280_.jpg',
    priceString: '₹1,549',
    badge: 'Best Seller',
    rating: 4.0,
    reviewCount: '100',
    href: 'https://link.amazon/B07tueuOY',
    enabled: true,
  },
  // Add more products below following the same shape.
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function StarRating({ rating }) {
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div aria-label={`${rating} out of 5 stars`} className="flex items-center gap-0.5 text-amber-400 text-[11px]">
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`}>★</span>)}
      {half && <span className="opacity-60">★</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="opacity-20">★</span>)}
    </div>
  )
}

/* ─── Grid card (full-width pages) ──────────────────────────────────────── */

function GridCard({ product }) {
  const {
    title, category, description, buttonText,
    icon, imageUrl, priceString, badge,
    rating, reviewCount, href,
  } = product
  const [imgError, setImgError] = useState(false)
  const showImage = imageUrl && !imgError

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-edge bg-panel shadow-sm transition-all duration-200 ease-out hover:scale-[1.01] hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5">
      {/* Image zone */}
      <div className="relative overflow-hidden bg-white">
        {badge && (
          <div className="absolute left-3 top-3 z-10">
            <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#0F0F13] shadow-md">
              🔥 {badge}
            </span>
          </div>
        )}
        {showImage ? (
          <img
            src={imageUrl} alt={title}
            onError={() => setImgError(true)}
            className="h-52 w-full object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-52 items-center justify-center">
            <span aria-hidden="true" className="text-6xl">{icon}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-panel to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="w-fit rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
          {category}
        </span>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-hi">{title}</h3>
        {rating != null && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={rating} />
            <span className="text-[11px] text-lo">{rating} {reviewCount && `· ${reviewCount}`}</span>
          </div>
        )}
        <p className="flex-1 text-xs leading-relaxed text-mid">{description}</p>
        <div className="mt-2 flex flex-col gap-3 border-t border-edge pt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-hi">{priceString}</span>
            <span className="text-[10px] text-lo">incl. all taxes</span>
          </div>
          <a
            href={href} target="_blank" rel="noopener noreferrer sponsored"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-black text-[#0F0F13] shadow-md shadow-amber-500/20 transition-all duration-150 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {buttonText}
          </a>
        </div>
      </div>
    </article>
  )
}

/* ─── Sidebar card (compact, fits 320 px right column) ──────────────────── */

function SidebarCard({ product }) {
  const { title, icon, imageUrl, priceString, badge, rating, reviewCount, href, buttonText } = product
  const [imgError, setImgError] = useState(false)
  const showImage = imageUrl && !imgError

  return (
    <article className="group flex gap-3 rounded-xl border border-edge bg-panel p-3 transition-all duration-200 hover:border-amber-500/30 hover:shadow-md hover:shadow-amber-500/5">
      {/* Thumbnail */}
      <a href={href} target="_blank" rel="noopener noreferrer sponsored" aria-label={title} className="relative shrink-0">
        <div className="relative h-18 w-18 overflow-hidden rounded-lg bg-white">
          {badge && (
            <span className="absolute left-0 top-0 z-10 rounded-br-lg bg-amber-400 px-1.5 py-0.5 text-[8px] font-black uppercase text-[#0F0F13] leading-none">
              🔥
            </span>
          )}
          {showImage ? (
            <img
              src={imageUrl} alt={title}
              onError={() => setImgError(true)}
              className="h-full w-full object-contain p-1.5 transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl">
              <span aria-hidden="true">{icon}</span>
            </div>
          )}
        </div>
      </a>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-hi">{title}</p>

        {rating != null && (
          <div className="flex items-center gap-1">
            <StarRating rating={rating} />
            {reviewCount && <span className="text-[10px] text-lo">{reviewCount}</span>}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-sm font-black text-hi">{priceString}</span>
          <a
            href={href} target="_blank" rel="noopener noreferrer sponsored"
            className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-[11px] font-black text-[#0F0F13] transition-colors hover:bg-amber-300 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </article>
  )
}

/* ─── Main export ────────────────────────────────────────────────────────── */

/**
 * AffiliateAdGrid
 *
 * Props:
 *   isAffiliateModuleActive  {boolean}   – global on/off switch (default true)
 *   variant                  {"grid"|"sidebar"}
 *     "grid"    – full-width 1→2→3 column responsive grid (default, for home/browse)
 *     "sidebar" – compact stacked list, fits the 320 px MemePage right column
 */
export default function AffiliateAdGrid({ isAffiliateModuleActive = true, variant = 'grid' }) {
  const [devOverride, setDevOverride] = useState(isAffiliateModuleActive)
  const moduleActive = import.meta.env.DEV ? devOverride : isAffiliateModuleActive
  const visibleProducts = AFFILIATE_PRODUCTS.filter((p) => p.enabled)

  if (!moduleActive || visibleProducts.length === 0) return null

  const isSidebar = variant === 'sidebar'

  return (
    <section aria-labelledby={`affiliate-heading-${variant}`} className={isSidebar ? 'mt-4' : 'w-full py-10'}>

      {/* Header */}
      {isSidebar ? (
        <h2
          id={`affiliate-heading-${variant}`}
          className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500"
        >
          <span aria-hidden="true">🛒</span> Amazon Picks
        </h2>
      ) : (
        <div className="mb-8 flex flex-col gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Amazon Picks</p>
          <h2 id={`affiliate-heading-${variant}`} className="font-display text-2xl tracking-wide text-hi">
            RECOMMENDED FOR YOU
          </h2>
          <p className="text-sm text-mid">Handpicked products — tap to see the latest price on Amazon.</p>
        </div>
      )}

      {/* Product list */}
      {isSidebar ? (
        <div className="flex flex-col gap-2">
          {visibleProducts.map((product) => (
            <SidebarCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <GridCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Disclosure */}
      <p className={`text-[10px] leading-relaxed text-lo ${isSidebar ? 'mt-3' : 'mt-8 text-center'}`}>
        *As an Amazon Associate, Vidsaur earns from qualifying purchases.
      </p>

      {/* Dev toggle */}
      {import.meta.env.DEV && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setDevOverride((v) => !v)}
            className="rounded-lg border border-edge bg-panel-hover px-3 py-1.5 text-[11px] font-medium text-mid hover:text-hi"
          >
            [DEV] Module{' '}
            <strong className={devOverride ? 'text-emerald-500' : 'text-brand'}>
              {devOverride ? 'ON' : 'OFF'}
            </strong>
          </button>
        </div>
      )}
    </section>
  )
}
