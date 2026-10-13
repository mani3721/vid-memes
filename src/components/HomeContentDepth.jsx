export default function HomeContentDepth() {
  return (
    <section
      id="adsense-compliance-baseline"
      aria-labelledby="adsense-compliance-heading"
      itemScope
      itemType="https://schema.org/FAQPage"
      style={{
        color: 'var(--text-primary)',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-edge)',
        borderRadius: '16px',
        fontSize: '16px',
        lineHeight: 1.7,
        marginTop: '2.5rem',
        padding: 'clamp(1.25rem, 4vw, 2.5rem)',
      }}
    >
      <h2 id="adsense-compliance-heading" className="font-display text-2xl tracking-wide text-hi sm:text-3xl">
        Videsaur Platform Manifesto &amp; Editorial Curation Framework
      </h2>

      <div className="mt-5 space-y-4" style={{ color: 'var(--text-secondary)' }}>
        <p>
          Videsaur is an authoritative digital media archival repository, creative utility
          database, and curation workshop built for media professionals, video editors, social
          media teams, streamers, and independent content creators. Rather than operating as a
          simple download hub, the platform documents the changing visual and audio vocabulary of
          online culture. Its catalog brings together short-form reaction video clips, looping
          graphics, adaptable templates, sound effects, and soundboard material in an organized
          environment where creators can identify useful references, compare formats, and plan
          responsible edits for YouTube Shorts, Instagram Reels, streaming segments, commentary,
          and other transformative productions.
        </p>
        <p>
          Editorial curation is centered on practical discoverability and contextual accuracy.
          Assets are classified by media type, subject, mood, language, and creative function so
          that an editor can move from an idea to an appropriate source efficiently. Descriptive
          titles, preview media, format details, and license labels are maintained as working
          metadata rather than decorative keywords. Videsaur reviews published entries for
          relevance and policy compliance, corrects inaccurate records, and provides reporting
          and takedown channels. This framework supports a useful, navigable archive while
          recognizing that access to a file never replaces the creator&rsquo;s duty to evaluate
          rights, context, and platform rules before publication.
        </p>
      </div>

      <h3 className="mt-8 font-display text-xl tracking-wide text-hi">
        The Programmatic Role of Short-Form Media Assets in Modern Digital Communication
      </h3>
      <div className="mt-4 space-y-4" style={{ color: 'var(--text-secondary)' }}>
        <p>
          Short media elements now function much like punctuation in digital storytelling. A
          reaction cutaway can clarify tone, a brief loop can establish rhythm, and a precisely
          timed audio cue can make a transition understandable without adding narration. For
          editors working under tight publishing schedules, a searchable utility database reduces
          the time spent locating technically suitable material and leaves more time for original
          scripting, criticism, education, parody, or commentary. Videsaur therefore treats each
          item as a component in a larger creative workflow, not as a finished substitute for
          original expression.
        </p>
        <p>
          The most valuable use of an archived clip is usually transformative: trimming it,
          combining it with original footage, adding analysis, changing its sequence, or using it
          to illustrate a new message. Videsaur&rsquo;s previews and categories help professionals
          assess those possibilities before downloading. They do not grant ownership of third-party
          characters, performances, trademarks, music, or footage. Clear separation between CC0
          material and editorial material helps users make informed decisions, while links to the
          Terms and Content &amp; DMCA Policy explain the standards applied to the repository.
        </p>
      </div>

      <h3 className="mt-8 font-display text-xl tracking-wide text-hi">
        Comprehensive Platform Utility Matrix &amp; Core FAQ Schema
      </h3>
      <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
        The following operational guidance explains how the archive supports research and editing,
        how records are maintained, and where responsibility rests when material is republished.
      </p>

      <div className="mt-5 divide-y" style={{ borderColor: 'var(--border-edge)' }}>
        {HOME_FAQ.map(({ question, answer }) => (
          <article
            key={question}
            className="py-5 first:pt-0 last:pb-0"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h4 className="font-semibold text-hi" itemProp="name">{question}</h4>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }} itemProp="text">
                {answer}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const HOME_FAQ = [
  {
    question: 'What specific purpose does Videsaur serve for online video producers?',
    answer: 'Videsaur provides a curated research and production library for locating reaction clips, loops, templates, graphics, and sound cues that can support a larger original edit. Producers can preview and compare assets for Shorts, Reels, livestreams, explainers, and social campaigns. The service is designed to improve discovery and workflow planning; it does not present an archived asset as a complete creative work or guarantee that every possible use is permitted.',
  },
  {
    question: 'How does the platform ensure media asset indexing and data cleanliness?',
    answer: 'Entries are organized with descriptive titles, media categories, mood and language signals, technical formats, previews, and applicable license labels. Published material is subject to editorial review and may be corrected, recategorized, unpublished, or removed when metadata is misleading, a file is broken, or a policy concern is reported. This continuing maintenance keeps search results useful without claiming that automated or human classification can be error-free.',
  },
  {
    question: 'Are there forced registration or subscription walls to access the media feeds?',
    answer: 'No. Visitors can browse public feeds, inspect asset pages, search the catalog, and access available downloads without a mandatory account or paid subscription. Optional account features may help a user save favorites, organize collections, or receive relevant notifications, but they are not a condition for viewing the public repository. Availability can still depend on moderation status, regional law, technical maintenance, or removal requests.',
  },
  {
    question: 'How does Videsaur approach digital copyright, trademark integrity, and fair-use boundaries?',
    answer: 'Videsaur distinguishes public-domain or CC0 records from editorial material and provides Terms and a Content & DMCA Policy for notices and takedowns. Fair use is context-specific and can depend on purpose, transformation, amount used, and market effect; it is not automatically created by downloading or adding a credit. Trademarks, recognizable people, music, and third-party footage may carry separate restrictions, so creators must review the asset label and obtain legal advice when necessary.',
  },
  {
    question: 'Can creative editors safely mix these assets into monetized commercial streams?',
    answer: 'Only when the rights and license attached to the selected asset permit that use. CC0 material generally allows commercial reuse, subject to unrelated rights such as trademarks, privacy, or publicity. Editorial material should not be assumed to authorize advertising, sponsorship, merchandise, or monetized entertainment. Editors should verify the source record, preserve evidence of the applicable license, add substantial original value, follow each distribution platform’s rules, and secure permission whenever the intended commercial use is uncertain.',
  },
]
