/**
 * Homepage editorial copy + FAQ — the "visible content" half of the
 * AdSense/Googlebot content-depth checklist in COMPLIANCE.md (the homepage
 * item was unchecked; this fills it with real copy instead of padding).
 *
 * The FAQ text below is kept byte-identical to FAQ_SCHEMA in utils/seo.js —
 * that JSON-LD is rendered by BrowseFeed's <SEO schemas={...}>, and a
 * FAQPage schema whose answers don't match the visible page text is exactly
 * what gets an SEO rich-result penalized rather than earning one.
 */
export default function HomeContentDepth() {
  return (
    <section aria-labelledby="home-content-depth-heading" className="mt-10 border-t border-edge pt-10">
      <h2
        id="home-content-depth-heading"
        className="mb-4 font-display text-base tracking-wide text-hi sm:text-lg"
      >
        WHAT VIDESAUR IS
      </h2>
      <div className="space-y-4 text-sm leading-7 text-mid">
        <p>
          Videsaur is a free library of short-form meme videos, animated GIFs, blank meme
          templates, and sound effects, built for the people who turn that raw material into
          something new &mdash; video editors, social media managers, streamers, and anyone
          putting together a Reel, a Short, a WhatsApp status, or a group chat reply that needs
          to land. Every asset is HD, watermark-free, and downloadable without an account, a
          waitlist, or a paywall: find the clip, download it, use it.
        </p>
        <p>
          That matters because a lot of what goes into finished short-form content isn&rsquo;t
          original footage &mdash; it&rsquo;s a reaction clip dropped into an edit, a sound
          effect under a jump cut, a template repurposed with new text. Videsaur exists to be the
          source library for that layer of the work: clips and sounds that are easy to search by
          mood or category, fast to preview, and free to actually use once you&rsquo;ve found
          them, instead of scattered across forums, Discord servers, and watermark-locked stock
          sites.
        </p>
      </div>

      <h3 className="mb-3 mt-8 font-display text-sm tracking-wide text-hi">
        WHY SHORT-FORM CLIPS AND SOUND EFFECTS MATTER FOR MODERN CONTENT CREATION
      </h3>
      <div className="space-y-4 text-sm leading-7 text-mid">
        <p>
          Reaction clips, loop backgrounds, and sound effects aren&rsquo;t filler &mdash;
          they&rsquo;re load-bearing parts of how short-form video actually communicates. A
          well-placed reaction GIF carries tone a caption can&rsquo;t. A whoosh or glitch sound
          effect sells a transition that would otherwise feel flat. A blank meme template lets
          someone join a format that&rsquo;s already trending instead of starting from nothing.
          None of that requires the creator to produce the raw asset themselves; it requires a
          library where the asset is easy to find, properly categorized, and legally clear to
          use &mdash; which is the specific gap Videsaur is built to fill.
        </p>
        <p>
          The catalogue is organized by format (video, GIF, sound, template) and by category and
          mood, so a creator looking for &ldquo;sarcastic reaction&rdquo; or &ldquo;sad piano
          sting&rdquo; can filter down instead of scrolling a flat feed. New uploads go through an
          admin review step before they go live &mdash; checked for correct categorization and
          policy compliance &mdash; so what&rsquo;s published is deliberately curated rather than
          an unmoderated dump.
        </p>
      </div>

      <h3 className="mb-3 mt-8 font-display text-sm tracking-wide text-hi">
        LICENSING, MODERATION &amp; TAKEDOWNS
      </h3>
      <div className="space-y-4 text-sm leading-7 text-mid">
        <p>
          Every asset on Videsaur carries one of two license tags, shown on its download page:{' '}
          <strong className="text-hi">CC0</strong> (public domain &mdash; free for personal and
          commercial use, no attribution required) or{' '}
          <strong className="text-hi">Editorial</strong> (restricted to non-commercial and
          transformative use). That distinction is the thing to check before dropping an asset
          into monetized work &mdash; CC0 clears that bar outright, Editorial-licensed assets do
          not. Full terms live on the{' '}
          <a href="/terms" className="text-hi underline underline-offset-2 hover:text-brand">
            Terms &amp; Conditions
          </a>{' '}
          page.
        </p>
        <p>
          If a published asset turns out to infringe a copyright or violate content policy, it
          gets unpublished and removed from search immediately rather than quietly left up. The{' '}
          <a href="/content-policy" className="text-hi underline underline-offset-2 hover:text-brand">
            Content &amp; DMCA Policy
          </a>{' '}
          page covers the full takedown process and the designated contact for a notice.
        </p>
      </div>

      <h3 className="mb-3 mt-8 font-display text-sm tracking-wide text-hi">
        FREQUENTLY ASKED QUESTIONS
      </h3>
      {/* 16 items below the fold — content-visibility skips layout/paint for
          the ones off-screen until they scroll into view. */}
      <div className="divide-y divide-edge border-y border-edge [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
        {HOME_FAQ.map(({ q, a }) => (
          <details key={q} className="group py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-hi marker:content-none">
              {q}
            </summary>
            <p className="mt-2 text-sm leading-7 text-mid">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/**
 * Kept in lockstep with FAQ_SCHEMA in utils/seo.js by hand — pulling the
 * schema's mainEntity array directly would couple visible copy to JSON-LD
 * shape, so the two are duplicated on purpose. Change both together.
 */
const HOME_FAQ = [
  {
    q: 'How do I download memes from Videsaur?',
    a: 'Click the download button on any meme card. Your file downloads instantly in MP4, GIF, WebM, or PNG format — no account or sign-up required.',
  },
  {
    q: 'Are Videsaur memes completely free to download?',
    a: 'Yes. All memes on Videsaur are free to browse and download with no watermark. No subscription, no login, no hidden fees.',
  },
  {
    q: 'Can I use these memes in commercial YouTube videos?',
    a: 'Many assets are available under the CC0 (public domain) license, which permits commercial use. Assets marked Editorial are for non-commercial and transformative use only. Always check the license badge on each meme before monetised publication.',
  },
  {
    q: 'Does Videsaur have green screen meme clips?',
    a: 'Yes. Videsaur offers green screen (chroma key) meme clips and transparent PNG memes with alpha channels, ready to drop into CapCut, Premiere Pro, DaVinci Resolve, or After Effects.',
  },
  {
    q: 'What video formats are available for download?',
    a: 'Videsaur offers MP4, GIF, WebM (with optional alpha transparency), and PNG. Meme sound effects are available as standalone audio downloads on the Sounds page.',
  },
  {
    q: 'Do I need to create an account to use Videsaur?',
    a: 'No. You can browse, search, and download memes as a guest with no sign-up required. Creating a free account just lets you save Favorites, organize Collections, and get notified about new content.',
  },

  {
    q: 'Are there Tamil memes on Videsaur?',
    a: 'Yes. Use the language toggle on the Feed page to switch between Tamil and English content, including Tamil movie reaction clips, dialogues, and templates.',
  },

  {
    q: 'Can I create my own memes on Videsaur?',
    a: 'Yes. Use the Create Meme tool to upload your own clip, trim it to the exact moment you want, and export it as an MP4 or GIF — no editing software needed.',
  },

  {
    q: 'What are Collections and how are they different from Favorites?',
    a: 'Collections let you organize your saved memes into named folders (like "Work Chat" or "Savage Replies") instead of one long Favorites list, making it easier to find exactly what you saved later.',
  },

  {
    q: 'Does Videsaur have sound effects and meme audio?',
    a: 'Yes. The Sounds page has a growing library of meme sound effects and soundboards you can preview and download as standalone MP3/audio files — great for video editors and streamers.',
  },

  {
    q: 'Can I download meme templates to make my own version?',
    a: 'Yes. The Templates page has blank, editable meme templates based on trending formats — download one and add your own caption using any image editor.',
  },

  {
    q: 'What is the AI Voice feature?',
    a: 'AI Voice lets you generate custom audio clips in different voices and tones to pair with your memes or video edits — useful for dubbing, voiceovers, or adding a funny narration to your content.',
  },

  {
    q: 'Can I share a meme directly to WhatsApp or Instagram?',
    a: 'Yes. Every meme page has a share button that lets you copy the direct link or share instantly to WhatsApp, Instagram, and other apps without needing to download first.',
  },

  {
    q: 'How often is new content added?',
    a: 'New memes, GIFs, sounds, and templates are added daily. Check the "Fresh Off The Internet" section on the homepage or the Trending page for the latest additions.',
  },

  {
    q: 'I found a mistake or have a content request — how do I report it?',
    a: 'Use the Contact Us page to report incorrect tags, broken downloads, or to request specific memes/templates you\'d like to see added.',
  },

  {
    q: 'Does Videsaur work on mobile?',
    a: 'Yes. Videsaur is fully responsive and works on any mobile browser — no app installation required to browse, download, or create memes.',
  },

  {
    q: 'What does the CC0 vs Editorial license badge mean?',
    a: 'CC0 means the asset is public domain and free for any use, including commercial projects. Editorial means the clip (often featuring real people or copyrighted footage) is intended for non-commercial, transformative use only — check the badge on each meme page before using it in monetized content.',
  },
]
