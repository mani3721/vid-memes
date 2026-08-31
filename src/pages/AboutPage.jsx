import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Videsaur — Free Meme Videos, GIFs & Sound Effects"
        description="Videsaur is a free meme download library for creators and comedy fans. Learn about our mission, content licensing, and why we built the site."
        canonicalPath="/about"
      />
      <PolicyLayout
        title="About Videsaur"
        breadcrumb="About"
      >
        <PolicySection heading="What Is Videsaur?">
          <p>
            Videsaur is a free, daily-updated meme library for creators, video editors, and
            anyone who lives on internet culture. We curate meme videos, animated GIFs, blank
            templates, and standalone sound effects — all available for download with no
            watermark, no sign-up, and no subscription.
          </p>
          <p>
            The name blends <strong className="text-hi">video</strong> and{' '}
            <strong className="text-hi">dinosaur</strong> — a nod to the ancient, unstoppable
            force that meme culture has become. We&rsquo;re here because great content
            shouldn&rsquo;t be locked behind watermarks or paywalls.
          </p>
        </PolicySection>

        <PolicySection heading="What We Offer">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>480+ meme assets in MP4, GIF, WebM, and PNG formats</li>
            <li>Standalone meme sound effects (SFX) — Vine boom, Bruh, and more</li>
            <li>Green screen (chroma key) clips ready for CapCut, Premiere Pro, and DaVinci Resolve</li>
            <li>Transparent PNG templates with alpha-channel support for overlay work</li>
            <li>A daily-updated Trending section with the freshest internet content</li>
            <li>One-click download — no account or login ever required</li>
            <li>Multiple formats per asset: MP4 for video editors, GIF for messaging, PNG for stickers</li>
          </ul>
        </PolicySection>

        <PolicySection heading="Who We're Built For">
          <p>
            Videsaur serves two audiences equally: the <strong className="text-hi">casual
            meme fan</strong> who wants to download the latest viral clip for WhatsApp Status or
            Discord, and the <strong className="text-hi">professional content creator</strong>{' '}
            sourcing royalty-free meme assets for YouTube Shorts, Instagram Reels, TikTok, or
            client video projects.
          </p>
          <p>
            The Browse mode is designed for fast discovery. The Editor Mode gives video
            professionals access to format filters, aspect ratio selectors, license type, and
            alpha/green-screen toggles — the metadata a working editor actually needs.
          </p>
        </PolicySection>

        <PolicySection heading="Our Content Standards">
          <p>
            We take copyright seriously. Every asset on Videsaur falls into one of three
            categories:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-hi">CC0 (Public Domain)</strong> — No rights reserved.
              Free for any use including commercial.
            </li>
            <li>
              <strong className="text-hi">Editorial</strong> — Licensed for non-commercial,
              commentary, or transformative use only. Cannot be used in monetised media without
              additional clearance.
            </li>
            <li>
              <strong className="text-hi">Pro</strong> — Extended commercial license. Check
              individual asset terms.
            </li>
          </ul>
          <p>
            We respond to DMCA takedown requests within 24–48 hours. If you believe content on
            Videsaur infringes your copyright, please see our{' '}
            <Link to="/content-policy" className="text-hi underline underline-offset-2 hover:text-brand">
              Content &amp; DMCA Policy
            </Link>
            .
          </p>
        </PolicySection>

        <PolicySection heading="Contact">
          <p>
            General questions:{' '}
            <a href="mailto:hello@videsaur.com" className="text-hi hover:text-brand">
              hello@videsaur.com
            </a>
          </p>
          <p>
            Copyright / DMCA:{' '}
            <a href="mailto:dmca@videsaur.com" className="text-hi hover:text-brand">
              dmca@videsaur.com
            </a>
          </p>
          <p>
            We aim to respond to all enquiries within 2–3 business days, and to copyright
            notices within 24–48 hours.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
