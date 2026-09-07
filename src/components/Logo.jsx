export default function Logo({ hideText = false }) {
  return (
    <a
      href="/"
      aria-label="Vidsour — home"
      className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
    >
      <img
        src="/vidsour-logo.webp"
        alt="Vidsour logo"
        className="size-9 shrink-0 opacity-90"
      />

      {!hideText && (
        // Below 360px the wordmark is what pushes the header over the viewport:
        // the hamburger + logo and the three 36px action buttons are all
        // shrink-0, so the overflow fell on the profile button, clipping its
        // right edge off-screen at 320px. Dropping the text keeps the mark and
        // leaves every touch target at full size.
        <span className="font-display text-xl tracking-wide max-[359px]:hidden">
          <span className="text-brand-gradient">VID</span>
          <span className="text-brand">SAUR</span>
        </span>
      )}
    </a>
  )
}
