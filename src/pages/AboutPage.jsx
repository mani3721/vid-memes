import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Vidsaur — Free Meme Videos, GIFs & Sound Effects"
        description="Vidsaur is a free meme library for creators and comedy fans. HD videos, GIFs, sounds, and templates — no watermarks, no sign-up, just content."
        canonicalPath="/about"
      />
      <PolicyLayout
        title="About Vidsaur"
        breadcrumb="About"
      >
        <PolicySection heading="Where the internet's best reactions live">
          <p className="mb-4">
            Vidsaur started with a simple idea: memes shouldn&rsquo;t be hard to find, slow to
            load, or buried under watermarks. We built a home for the clips, GIFs, sounds, and
            templates that make group chats funnier and social media posts hit different &mdash;
            all free, all fast, all yours to use.
          </p>
          <p>
            Whether you&rsquo;re hunting for that one perfect reaction video, building a meme
            from scratch, or just scrolling to kill ten minutes, Vidsaur is built to make that
            experience actually enjoyable &mdash; not cluttered, not confusing, just content
            that loads fast and downloads clean.
          </p>
        </PolicySection>

        <PolicySection heading="What makes us different">
          <p className="mb-4">
            We&rsquo;re not just another meme dump. Every piece of content on Vidsaur &mdash;
            video, GIF, sound, or template &mdash; goes through the same standard: clear
            quality, correct categorization, and zero unnecessary friction between you and the
            download button.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-hi">Meme Videos &amp; Clips</strong> &mdash; HD,
              watermark-free, ready for WhatsApp status, Reels, or Shorts in seconds.
            </li>
            <li>
              <strong className="text-hi">GIFs</strong> &mdash; Curated animated reactions for
              texts, comments, and social posts that need one perfect visual punchline.
            </li>
            <li>
              <strong className="text-hi">Sound Effects &amp; Soundboards</strong> &mdash; A
              growing library of meme audio clips and interactive sound buttons for instant
              playback &mdash; great for editors, streamers, and content creators who need the
              right sound at the right moment.
            </li>
            <li>
              <strong className="text-hi">Meme Templates</strong> &mdash; Blank, editable
              templates so you can build your own version of whatever&rsquo;s trending right now.
            </li>
            <li>
              <strong className="text-hi">Transition Hooks</strong> &mdash; Clean, professional
              video transitions for creators who want their edits to feel polished, not amateur.
            </li>
          </ul>
        </PolicySection>

        <PolicySection heading="Why we do this">
          <p className="mb-4">
            The internet moves fast, and humor moves faster. Our goal is simple: keep pace with
            what&rsquo;s actually trending, curate it properly, and make sure the people using
            Vidsaur &mdash; creators, editors, casual scrollers, meme lords &mdash; never have
            to dig through junk to find something worth sharing.
          </p>
          <p className="mb-3">
            We built Vidsaur around three ideas that guide everything we add:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-hi">Quality over quantity</strong> &mdash; we&rsquo;d
              rather have content that&rsquo;s actually funny than a bloated library of filler.
            </li>
            <li>
              <strong className="text-hi">Zero friction</strong> &mdash; no forced sign-ups, no
              shady redirects, no watermark tax. Find it, download it, use it.
            </li>
            <li>
              <strong className="text-hi">Always evolving</strong> &mdash; new features, new
              formats, and new content land regularly, because a meme site that stands still
              gets left behind.
            </li>
          </ul>
        </PolicySection>

        <PolicySection heading="Get in touch">
          <p>
            Got a meme worth adding, a feature idea, or something that&rsquo;s not working
            right? We actually read what comes through our{' '}
            <Link to="/contact" className="text-hi underline underline-offset-2 hover:text-brand">
              Contact Us
            </Link>{' '}
            page &mdash; reach out anytime.
          </p>
        </PolicySection>

        <PolicySection heading="Thanks for being here">
          <p>
            Every scroll, download, and share helps Vidsaur grow into something better.
            We&rsquo;re building this for the community using it &mdash; so thank you for being
            part of it, and here&rsquo;s to finding your next favorite meme.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
