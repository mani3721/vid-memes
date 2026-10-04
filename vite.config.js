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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), asyncCssPlugin()],
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
