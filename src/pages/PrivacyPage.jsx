import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

const listClasses = 'list-disc space-y-1.5 pl-5 text-mid'
const linkClasses = 'text-hi underline underline-offset-2 hover:text-brand'

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy — Videsaur.co.in"
        description="Read the Videsaur.co.in Privacy Policy to learn how we collect, process, manage, protect, and disclose personal data when you use our platform."
        canonicalPath="/privacy"
      />
      <PolicyLayout title="Privacy Policy" lastUpdated="October 8, 2026">
        <PolicySection heading="1. Introduction">
          <p>
            Welcome to <strong className="text-hi">Videsaur.co.in</strong> (the
            &ldquo;Platform&rdquo;). We respect your fundamental rights to privacy and are strictly
            committed to safeguarding your personal data. This Privacy Policy outlines our
            operational frameworks regarding how we collect, process, manage, and protect data
            signals when you interact with our digital media asset repository, curation tools, and
            integrated features.
          </p>
        </PolicySection>

        <PolicySection heading="2. Information We Collect">
          <h3 className="font-semibold text-hi">2.1 Information You Provide Authentically</h3>
          <ul className={listClasses}>
            <li>Account registration parameters (usernames, validated email endpoints, encrypted credential hashes).</li>
            <li>System preferences, curated collection mappings, and user interface selections.</li>
            <li>User-contributed cultural media elements, comments, or configurations.</li>
            <li>Communication records directed to our administration via support ticketing or corporate contact forms.</li>
          </ul>

          <h3 className="font-semibold text-hi">2.2 Automatically Aggregated Data Signals</h3>
          <ul className={listClasses}>
            <li>Technical machine properties (Internet Protocol [IP] addresses, user-agent browser tokens, operating systems).</li>
            <li>Navigation logs (thematic page views, telemetry session times, user click streams, and media asset download metrics).</li>
            <li>Local cookies, web beacons, and equivalent browser storage tracking hooks.</li>
            <li>
              Coarse geographic location signals (approximate country or regional indicators)
              processed passively via edge host networks strictly for server-side template routing
              and interface theme assignments. We do not query fine GPS telemetry coordinates or
              retain location streams for ad targeting profiles.
            </li>
          </ul>
        </PolicySection>

        <PolicySection heading="3. How We Process Data Elements">
          <p>We leverage collected signals under strict compliance boundaries to fulfill specific functional goals:</p>
          <ul className={listClasses}>
            <li>To initialize, scale, and manage our static and dynamic asset curation indexes.</li>
            <li>To process specific workspace extractions and developer download requests cleanly.</li>
            <li>To evaluate aggregate performance telemetry, reduce database server bottlenecks, and secure site architecture.</li>
            <li>To route critical policy updates and clear administrative security validations.</li>
            <li>To safely serve contextual and programmatic advertisements optimized via authorized third-party ad networks.</li>
          </ul>
        </PolicySection>

        <PolicySection heading="4. Tracking and Cookie Architecture">
          <p>
            Videsaur deploys cookies and tracking pixels to optimize network retrieval, analyze site
            traffic via analytics, and track consent selections. You retain full system control via
            your browser interface to filter out tracking cookies or block cookie execution. Note
            that completely dropping local storage tags may degrade interactive interface layers or
            slow local asset configurations.
          </p>
        </PolicySection>

        <PolicySection heading="5. Advertising Compliance — Google AdSense and Third-Party Vendors">
          <p>
            Videsaur integrates the <strong className="text-hi">Google AdSense</strong>{' '}
            programmatic platform, operated by Google LLC (1600 Amphitheatre Parkway, Mountain View,
            CA 94043, USA), to deliver monetization spaces across our content grids.
          </p>

          <h3 className="font-semibold text-hi">5.1 Google Interest-Based Advertising &amp; Cookies</h3>
          <p>
            Google and its certified third-party vendor networks deploy tracking cookies (such as
            the primary Google advertising cookies and universal resource identifiers) to evaluate
            your digital footprint across this domain and secondary channels. This tracking allows
            Google to algorithmically serve targeted advertisements directly matching your past
            browsing preferences and site interactions.
          </p>

          <h3 className="font-semibold text-hi">5.2 Opting Out of Targeted Advertising Profiles</h3>
          <p>
            Users maintain the absolute legal option to revoke consent and opt out of interest-based
            behavioral profiling. To completely manage or block Google&rsquo;s advertising hooks,
            you can adjust settings inside the official{' '}
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className={linkClasses}>
              Google Ads Settings Control Page
            </a>
            . Alternatively, you can block broader third-party networks from deploying targeted ad
            tracking by visiting the{' '}
            <a href="https://networkadvertising.org" target="_blank" rel="noopener noreferrer" className={linkClasses}>
              Network Advertising Initiative (NAI) Opt-Out Portal
            </a>{' '}
            or the{' '}
            <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer" className={linkClasses}>
              Digital Advertising Alliance (DAA) Portal
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection heading="6. Regulated Data Sharing and Disclosures">
          <p>
            We do not sell, trade, or distribute your raw identity details to unverified third
            parties. Controlled data transfers execute strictly under the following scenarios:
          </p>
          <ul className={listClasses}>
            <li>With trusted infrastructure providers (such as cloud hosting providers, static file CDNs, and database clusters) to guarantee site performance.</li>
            <li>With approved programmatic ad partners to serve ad targets in compliance with Section 5.</li>
            <li>To comply with binding legal demands, court summonses, or statutory regulatory mandates.</li>
          </ul>
        </PolicySection>

        <PolicySection heading="7. Data Protection Benchmarks">
          <p>
            We maintain appropriate organizational and programmatic security layers to limit risk
            and guard against malicious access traps or data losses. However, because no online
            transfer engine or cloud data center provides 100% impenetrable coverage, we cannot
            provide an absolute structural guarantee against unexpected breaches.
          </p>
        </PolicySection>

        <PolicySection heading="8. Universal Digital Freedom Rights">
          <p>
            Regardless of your geographic location, Videsaur supports your ability to inspect the
            accuracy of your files. You have the right to request access to your stored profile data,
            modify incorrect fields, limit active processing loops, or demand complete deletion of
            your records via our management dashboard.
          </p>
        </PolicySection>

        <PolicySection heading="9. Children's Right to Security">
          <p>
            Our curation workshop targets digital developers, video producers, and social media
            managers; it is explicitly not designed for children under 13. We do not intentionally
            compile or index personal tracking records from minors. If a parent or safety
            coordinator identifies that a child has established a tracking record on our network,
            contact our support desk immediately for rapid data extraction.
          </p>
        </PolicySection>

        <PolicySection heading="10. European Union / United Kingdom Users — GDPR and UK Data Rights">
          <p>
            For visitors within the European Economic Area (EEA), European Union (EU), and the
            United Kingdom, we manage data under the{' '}
            <strong className="text-hi">General Data Protection Regulation (GDPR)</strong> and the
            UK Data Protection Act. Our operational handling relies on clear foundations: your
            explicit tracking consent, contractual performance execution, or our legitimate
            professional interest in maintaining site stability.
          </p>
          <h3 className="font-semibold text-hi">Your Explicit GDPR Entitlements</h3>
          <ul className={listClasses}>
            <li><strong className="text-hi">Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong className="text-hi">Rectification:</strong> Ask us to correct inaccurate or incomplete data.</li>
            <li><strong className="text-hi">Erasure:</strong> Ask us to delete your personal data where applicable.</li>
            <li><strong className="text-hi">Restriction:</strong> Ask us to limit how we process your data.</li>
            <li><strong className="text-hi">Portability:</strong> Receive your data in a structured, commonly used format.</li>
            <li><strong className="text-hi">Objection:</strong> Object to processing based on legitimate interests, direct marketing, or ad-targeting profiles.</li>
            <li><strong className="text-hi">Withdrawal of consent:</strong> Withdraw consent at any time where consent is our legal basis for processing.</li>
          </ul>
          <p>
            To exercise these rights, email{' '}
            <a href="mailto:support@videsaur.co.in" className={linkClasses}>support@videsaur.co.in</a>.
            We will respond in accordance with applicable law. You may also lodge a complaint with
            your local data protection authority.
          </p>
        </PolicySection>

        <PolicySection heading="11. California Residents — CCPA / CPRA Rights">
          <p>
            California residents may request access to, correction of, or deletion of eligible
            personal information. They may also opt out of the sale or sharing of personal
            information for cross-context behavioral advertising. We do not sell personal
            information for monetary consideration, but advertising-related disclosures may qualify
            as sharing under California law.
          </p>
          <p>
            Submit a verifiable request to{' '}
            <a href="mailto:support@videsaur.co.in" className={linkClasses}>support@videsaur.co.in</a>{' '}
            with the subject line &ldquo;CCPA Request.&rdquo; We will not discriminate against you
            for exercising your privacy rights.
          </p>
        </PolicySection>

        <PolicySection heading="12. Changes to This Privacy Policy">
          <p>
            We may update this Privacy Policy periodically. Changes will be published on this page,
            and the &ldquo;Last Updated&rdquo; date will be revised to identify the latest version.
          </p>
        </PolicySection>

        <PolicySection heading="13. Contact Us">
          <p>
            If you have questions about this Privacy Policy, email{' '}
            <a href="mailto:support@videsaur.co.in" className={linkClasses}>support@videsaur.co.in</a>{' '}
            or visit our{' '}
            <Link to="/contact" className={linkClasses}>Contact Us</Link> page.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
