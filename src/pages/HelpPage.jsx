import { Link } from 'react-router-dom'
import { Download, Upload, Heart, Search, Mail } from 'lucide-react'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

function HelpCard({ icon: Icon, title, children }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-edge bg-panel p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-volt/15 text-volt">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-hi">{title}</h3>
        <div className="text-sm text-mid">{children}</div>
      </div>
    </div>
  )
}

export default function HelpPage() {
  return (
    <>
      <SEO title="Help & Support — Videsaur" description="Get help with downloading memes, uploading content, and using Videsaur." canonicalPath="/help" />
      <PolicyLayout title="Help & Support" breadcrumb="Help">
        <div className="grid gap-4 sm:grid-cols-2">
          <HelpCard icon={Download} title="How to Download">
            <p>Click the download button on any meme card or detail page. You need to be signed in to download. Files download instantly — no watermark, no redirect.</p>
          </HelpCard>
          <HelpCard icon={Upload} title="How to Upload">
            <p>Go to <Link to="/upload" className="text-volt hover:underline">Upload</Link>. Supported formats: MP4, WebM (videos), GIF, PNG, JPEG, WebP (images), MP3, WAV (audio). Max file size is 50 MB for video.</p>
          </HelpCard>
          <HelpCard icon={Heart} title="Favorites">
            <p>Tap the heart icon on any card to save it. Your favorites are stored in a session — they persist across visits on the same browser without needing an account.</p>
          </HelpCard>
          <HelpCard icon={Search} title="Searching">
            <p>Use the search bar at the top of any page to find memes by title. You can also filter by category using the sidebar links (Videos, GIFs, Templates, Sounds).</p>
          </HelpCard>
        </div>

        <PolicySection heading="Frequently Asked Questions">
          <div className="space-y-4">
            {[
              ['Do I need an account to browse?', 'No — browsing is fully public. You only need an account to download or upload.'],
              ['Are the memes free to use?', 'Most content is CC0 (public domain). Some is marked Editorial — check the license badge on each meme before commercial use.'],
              ['How do I report infringing content?', 'Email dmca@videsaur.co.in with the meme URL and proof of ownership. We respond within 48 hours.'],
              ['Can I use memes in YouTube videos?', 'CC0 content can be used commercially. Editorial content is for non-commercial transformative use only.'],
              ['My upload failed — what should I check?', 'Ensure the file is under the size limit and in a supported format. Make sure you are signed in before uploading.'],
            ].map(([q, a]) => (
              <div key={q}>
                <p className="font-semibold text-hi">{q}</p>
                <p className="mt-0.5">{a}</p>
              </div>
            ))}
          </div>
        </PolicySection>

        <PolicySection heading="Still Need Help?">
          <p className="flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-volt" />
            Email us at{' '}
            <a href="mailto:hello@videsaur.co.in" className="text-volt hover:underline">
              hello@videsaur.co.in
            </a>{' '}
            — we typically reply within 24 hours.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
