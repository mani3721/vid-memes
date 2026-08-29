export default function Logo({ hideText = false }) {
  return (
    <a
      href="/"
      aria-label="Vidsour — home"
      className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
    >
      <img
        src="/vidsour-logo.png"
        alt="Vidsour logo"
        className="size-9 shrink-0 opacity-90"
      />

      {!hideText && (
        <span className="font-display text-xl tracking-wide">
          <span className="text-brand-gradient">VID</span>
          <span className="text-brand">SAUR</span>
        </span>
      )}
    </a>
  )
}
