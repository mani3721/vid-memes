import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AppShell from './components/AppShell'
import StreakToast from './components/StreakToast'
import CookieBanner from './components/CookieBanner'
import { StudioProvider } from './store/StudioProvider'
import { useStudio } from './store/studioStore'
import { FavoritesProvider } from './store/FavoritesProvider'
import { AuthProvider } from './lib/authContext'

const BrowseFeed        = lazy(() => import('./components/BrowseFeed'))
const EditorModeLayout  = lazy(() => import('./components/EditorModeLayout'))
const MemePage          = lazy(() => import('./pages/MemePage'))
const TrendingPage      = lazy(() => import('./pages/TrendingPage'))
const CategoryPage      = lazy(() => import('./pages/CategoryPage'))
const AboutPage         = lazy(() => import('./pages/AboutPage'))
const ContactPage       = lazy(() => import('./pages/ContactPage'))
const PrivacyPage       = lazy(() => import('./pages/PrivacyPage'))
const TermsPage         = lazy(() => import('./pages/TermsPage'))
const DmcaPage          = lazy(() => import('./pages/DmcaPage'))
const DisclaimerPage    = lazy(() => import('./pages/DisclaimerPage'))
const CookiePolicyPage  = lazy(() => import('./pages/CookiePolicyPage'))
const HelpPage          = lazy(() => import('./pages/HelpPage'))
const UploadForm        = lazy(() => import('./components/UploadForm'))
const FavoritesPage     = lazy(() => import('./pages/FavoritesPage'))
const LoginPage         = lazy(() => import('./pages/LoginPage'))
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'))
const AISoundPage       = lazy(() => import('./pages/AISoundPage'))
const BlogIndexPage     = lazy(() => import('./pages/BlogIndexPage'))
const BlogPostPage      = lazy(() => import('./pages/BlogPostPage'))

function EditorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="size-6 animate-spin text-brand" />
      <span className="sr-only">Loading</span>
    </div>
  )
}

function Studio() {
  const { mode } = useStudio()

  if (mode === 'editor') {
    return (
      <Suspense fallback={<EditorFallback />}>
        <EditorModeLayout />
      </Suspense>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/"               element={<BrowseFeed />} />
        <Route path="/trending"       element={<TrendingPage />} />
        <Route path="/videos"         element={<CategoryPage category="videos"    />} />
        <Route path="/gifs"           element={<CategoryPage category="gifs"      />} />
        <Route path="/templates"      element={<CategoryPage category="templates" />} />
        <Route path="/sounds"         element={<CategoryPage category="sounds"    />} />
        <Route path="/meme/:slug"     element={<MemePage />} />
        <Route path="/about"          element={<AboutPage />} />
        <Route path="/contact"        element={<ContactPage />} />
        <Route path="/privacy"        element={<PrivacyPage />} />
        <Route path="/terms"          element={<TermsPage />} />
        <Route path="/content-policy" element={<DmcaPage />} />
        <Route path="/disclaimer"     element={<DisclaimerPage />} />
        <Route path="/cookie-policy"  element={<CookiePolicyPage />} />
        <Route path="/help"           element={<HelpPage />} />
        <Route path="/upload"         element={<UploadForm />} />
        <Route path="/favorites"      element={<FavoritesPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/admin"          element={<AdminDashboard />} />
        <Route path="/ai-sound"       element={<AISoundPage />} />
        <Route path="/blog"           element={<BlogIndexPage />} />
        <Route path="/blog/:slug"     element={<BlogPostPage />} />
        <Route path="*"               element={<BrowseFeed />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <StudioProvider>
          <Studio />
          <StreakToast />
          <CookieBanner />
        </StudioProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}
