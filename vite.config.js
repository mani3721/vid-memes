import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Converts Vite's injected blocking CSS link into a non-render-blocking preload.
// The onload swap applies the stylesheet after parse without stalling the initial paint.
// Trade-off: users may briefly see unstyled content (FOUC) if the CSS hasn't arrived
// before React renders. In practice the 12 KB file resolves fast enough that the window
// is imperceptible on typical connections, but it is not zero.
function asyncCssPlugin() {
  return {
    name: 'async-css',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet"(\s+crossorigin)? href="([^"]+\.css)">/g,
        (_, crossorigin, href) => {
          const co = crossorigin ?? ''
          return [
            `<link rel="preload" as="style"${co} href="${href}" onload="this.onload=null;this.rel='stylesheet'">`,
            `<noscript><link rel="stylesheet"${co} href="${href}"></noscript>`,
          ].join('\n    ')
        },
      )
    },
  }
}

// Preloads the Latin-subset variable font files so body/display text doesn't
// wait for the browser to discover them via the CSS @font-face rule first.
// Hand-writing the href would be wrong: Fontsource ships one file per Unicode
// range (latin, latin-ext, cyrillic, greek, vietnamese...) and Vite fingerprints
// every filename per build, so this reads the real names out of the finished
// bundle instead of guessing one. Only the "latin" subset is preloaded — the
// other ranges cover scripts this site's UI copy doesn't use, and preloading
// all nine files would just add unused network weight.
function fontPreloadPlugin() {
  const WANTED = [/inter-latin-wght-normal-.*\.woff2$/, /anton-latin-400-normal-.*\.woff2$/]

  return {
    name: 'font-preload',
    apply: 'build',
    transformIndexHtml(html, { bundle }) {
      const links = Object.values(bundle ?? {})
        .filter((file) => file.type === 'asset' && WANTED.some((re) => re.test(file.fileName)))
        .map((file) => `<link rel="preload" as="font" type="font/woff2" href="/${file.fileName}" crossorigin>`)

      if (!links.length) return html
      return html.replace('</head>', `    ${links.join('\n    ')}\n  </head>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), asyncCssPlugin(), fontPreloadPlugin()],
  build: {
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        // Vite 8 uses Rolldown, which only supports the function form of
        // manualChunks (the previous Rollup object form causes builds to fail).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
            return 'vendor-react'
          }
          if (id.includes('/@supabase/')) return 'vendor-supabase'
          if (id.includes('/lucide-react/')) return 'vendor-icons'
          if (id.includes('/@tiptap/')) return 'vendor-editor'
          return undefined
        },
      },
    },
  },
})
