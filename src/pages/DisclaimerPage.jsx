import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function DisclaimerPage() {
  return (
    <>
      <SEO
        title="Disclaimer — Videsaur.co.in"
        description="Review the Videsaur disclaimer covering fair use, user submissions, external links, technical limitations, and platform liability."
        canonicalPath="/disclaimer"
      />
      <PolicyLayout title="Disclaimer" breadcrumb="Disclaimer" lastUpdated="October 8, 2026">
        <PolicySection heading="1. General Information Baseline">
          <p>
            All digital media resources, system routing parameters, technical files, and
            contextual explanations indexed across <strong>Videsaur.co.in</strong> (the
            &ldquo;Platform&rdquo;) are provided strictly on an <strong>&ldquo;as is&rdquo;</strong>{' '}
            and <strong>&ldquo;as available&rdquo;</strong> operational basis. To the maximum
            extent permitted by applicable statutory laws, the Platform explicitly excludes all
            structural representations, warranties, or operational guarantees relating to this
            web application and its database layer contents.
          </p>
          <p>
            Videsaur does not warrant, promise, or guarantee that our file delivery network will
            operate completely uninterrupted, that server connections will remain accessible at
            all times, or that the aggregate historical data points mapped within our media
            arrays are error-free, entirely complete, or up to date.
          </p>
        </PolicySection>

        <PolicySection heading="2. Fair Use & Intellectual Property Curation Disclaimer">
          <p>
            Videsaur operates as a community index and utility workshop archiving cultural
            digital artifacts, short-form reaction video tracks, loopable animation structures,
            open soundboard components, and textless editing formats. The individual media
            elements indexed across our grids consist of pop-culture highlights, trending
            public-domain internet elements, and user-contributed media materials.
          </p>
          <p>
            We explicitly declare that Videsaur does not claim underlying copyright title or
            official trademark ownership over third-party media clips hosted on our network.
            These resources are compiled, categorized, and presented strictly under the
            statutory principles of <strong>Fair Use</strong> (in compliance with Section 107 of
            the United States Copyright Act and corresponding global digital media frameworks)
            for the purposes of parody, social commentary, cultural review, and educational
            transformation. The ultimate value of our library relies entirely on our users
            leveraging these clips to construct unique, highly transformed, non-competitive new
            creations.
          </p>
        </PolicySection>

        <PolicySection heading="3. User-Generated Telemetry & Submissions">
          <p>
            The Platform provides interactive lanes allowing community uploaders and digital
            creators to catalog media elements. Videsaur functions as a technical conduit and
            does not perform intensive manual screening of every asset before it enters public
            indexing viewports. Consequently, the Platform assumes zero legal accountability for
            the textual accuracy, historical origin files, or cultural opinions expressed within
            user-submitted elements. Digital producers and individual downloaders bear exclusive
            responsibility for the content they fetch, display, or distribute.
          </p>
        </PolicySection>

        <PolicySection heading="4. Third-Party Connections & External Networks">
          <p>
            Our platform grids and dynamic blog routes may occasionally feature anchor links
            connecting to external networks, content management providers, or external creator
            hubs that sit entirely outside the ownership or administrative control parameters of
            Videsaur. We possess no oversight regarding the operational practices, security
            protocols, or privacy frameworks of external destinations. You acknowledge that
            clicking external links transfers your data session into alternate spaces at your
            own operational risk.
          </p>
        </PolicySection>

        <PolicySection heading="5. System Performance & Technical Security Limits">
          <p>
            While our automated architecture enforces strict clean-room check routines to shield
            our file grids from anomalies, Videsaur cannot guarantee or warrant that the media
            asset components, file extractors, or Nginx/Vercel script engines are entirely free
            from underlying browser caching conflicts, code deprecations, or unexpected runtime
            bottlenecks. The download, processing, and caching of files acquired from our
            environment execute entirely inside your own computing discretion.
          </p>
        </PolicySection>

        <PolicySection heading="6. Clear Boundary of Platform Liability">
          <p>
            In no scenario or legal environment shall Videsaur, its administrative coordinators,
            development engineers, or platform associates be held liable for any downstream
            indirect, incidental, special, consequential, or punitive damages. This exclusion
            spans, without limitation, network fee overages, production file losses, database
            dropouts, commercial project delays, or loss of creative goodwill resulting directly
            from your utilization or inability to pull assets from our system channels—even if
            our support desk has been explicitly alerted to the risk of such operational gaps.
          </p>
        </PolicySection>

        <PolicySection heading="7. Structural Modifications & Tracking Update Clauses">
          <p>
            We preserve our total administrative right to adapt, rewrite, or completely replace
            this legal Disclaimer at any time without issuing individual notifications. We
            fulfill transparency demands by modifying the <strong>&ldquo;Last Updated&rdquo;</strong>{' '}
            indicator tracking parameters prominently featured at the top of this layout. Your
            ongoing interaction with our curation arrays signifies a total, unreserved acceptance
            of the revised framework bounds.
          </p>
        </PolicySection>

        <footer className="mt-10 border-t border-edge pt-5 text-center text-mid">
          <p>
            For explicit copyright inquiries, immediate takedown notifications, or clarification
            queries regarding this liability framework, connect directly with our compliance
            desk:{' '}
            <a
              href="mailto:support@videsaur.co.in"
              className="font-semibold text-hi underline underline-offset-2 hover:text-brand"
            >
              support@videsaur.co.in
            </a>
            .
          </p>
        </footer>
      </PolicyLayout>
    </>
  )
}
