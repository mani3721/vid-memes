import { Suspense, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

function ContentFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="size-6 animate-spin text-brand" />
      <span className="sr-only">Loading</span>
    </div>
  )
}

/**
 * Full-width top header + sidebar rail + scrollable content below.
 * Header: fixed, z-50, full viewport width, h-16 (4rem).
 * Sidebar: fixed, z-40, starts at top-16, spans the rest of the viewport.
 * Content: pushed right by sidebar width, pushed down by header height.
 */
export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Header onOpenSidebar={() => setSidebarOpen(true)} />

      {/* Body row — offset top by header height */}
      <div className="flex pt-16">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content — offset left by sidebar width */}
        <main className="min-w-0 flex-1 md:ml-16 lg:ml-65">
          <div className="px-4 pb-20 pt-5 sm:px-6">
            <Suspense fallback={<ContentFallback />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>

      <Footer />
    </>
  )
}
