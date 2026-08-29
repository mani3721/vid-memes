import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy — Videsaur"
        description="Videsaur Privacy Policy. Learn how we collect, use, and protect your data, including AdSense advertising, GDPR rights, and CCPA options."
        canonicalPath="/privacy"
      />
      <PolicyLayout title="Privacy Policy" breadcrumb="Privacy Policy" lastUpdated="27 August 2026">
        <PolicySection heading="Who We Are">
          <p>
            Videsaur (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website at{' '}
            <strong>videsaur.co.in</strong>. This policy explains what data we collect, why we
            collect it, and the rights you have over your data. If you have questions, email{' '}
            <a href="mailto:hello@videsaur.co.in" className="text-hi hover:text-volt">
              hello@videsaur.co.in
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection heading="Data We Collect">
          <p className="mb-3">We collect only what is necessary to operate the service:</p>
          <ul className="list-inside list-disc space-y-1.5 text-mid">
            <li>
              <strong className="text-hi">Usage data</strong> — pages visited, referrer URL,
              browser type, device type, and IP address (anonymised after 24 hours by our analytics
              provider).
            </li>
            <li>
              <strong className="text-hi">Cookie consent choice</strong> — stored locally in your
              browser under the key <code className="text-volt">videsaur.consent.v1</code>. We do
              not transmit this to our servers.
            </li>
            <li>
              <strong className="text-hi">Contact form data</strong> — name, email address, and
              message content when you submit our contact form. Used solely to respond to you.
            </li>
            <li>
              <strong className="text-hi">Advertising data</strong> — if you consent to
              advertising cookies, Google AdSense may collect interest and interaction data as
              described in the <em>Advertising</em> section below.
            </li>
          </ul>
        </PolicySection>

        <PolicySection heading="Cookies & Local Storage">
          <p className="mb-3">We use two categories of cookies:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge">
                  <th className="py-2 pr-4 text-left font-semibold text-hi">Category</th>
                  <th className="py-2 pr-4 text-left font-semibold text-hi">Provider</th>
                  <th className="py-2 text-left font-semibold text-hi">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-mid">
                <tr className="border-b border-edge/50">
                  <td className="py-2 pr-4">Essential</td>
                  <td className="py-2 pr-4">Videsaur</td>
                  <td className="py-2">Stores your cookie consent choice. Always active.</td>
                </tr>
                <tr className="border-b border-edge/50">
                  <td className="py-2 pr-4">Analytics (optional)</td>
                  <td className="py-2 pr-4">Google Analytics</td>
                  <td className="py-2">Aggregated page-view and session statistics. Requires consent.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Advertising (optional)</td>
                  <td className="py-2 pr-4">Google AdSense</td>
                  <td className="py-2">Interest-based ad personalisation. Requires consent.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            You can withdraw consent at any time by clearing your browser&rsquo;s local storage or
            by reopening the cookie banner (accessible in the site footer).
          </p>
        </PolicySection>

        <PolicySection heading="Advertising (Google AdSense)">
          <p className="mb-3">
            Videsaur uses Google AdSense to display advertisements. When you accept advertising
            cookies, Google may use cookies or device identifiers to show you interest-based ads.
            Google&rsquo;s advertising practices are governed by the{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi hover:text-volt"
            >
              Google Privacy Policy
            </a>
            .
          </p>
          <p>
            If you reject advertising cookies, we will still show non-personalised ads (contextual
            only). You can also opt out of interest-based advertising via{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi hover:text-volt"
            >
              Google Ad Settings
            </a>{' '}
            or{' '}
            <a
              href="https://optout.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi hover:text-volt"
            >
              AboutAds.info
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection heading="How We Use Your Data">
          <ul className="list-inside list-disc space-y-1.5 text-mid">
            <li>To operate and improve the website.</li>
            <li>To respond to enquiries and copyright takedown notices.</li>
            <li>To display contextual or (with consent) personalised advertisements.</li>
            <li>To comply with legal obligations.</li>
          </ul>
          <p className="mt-3">
            We do <strong className="text-hi">not</strong> sell your personal data to third
            parties. We do not use your data for automated decision-making or profiling that
            produces legal effects.
          </p>
        </PolicySection>

        <PolicySection heading="Data Retention">
          <ul className="list-inside list-disc space-y-1.5 text-mid">
            <li>Server logs: deleted or anonymised after 30 days.</li>
            <li>Contact form submissions: retained for up to 12 months, then deleted.</li>
            <li>Consent choice (localStorage): stored in your browser; never sent to our servers.</li>
            <li>Analytics data: retained per Google Analytics default (14 months), then purged.</li>
          </ul>
        </PolicySection>

        <PolicySection heading="Your Rights (GDPR — EEA / UK Residents)">
          <p className="mb-3">
            Under the General Data Protection Regulation (GDPR) and UK GDPR, you have the right to:
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-mid">
            <li><strong className="text-hi">Access</strong> — request a copy of data we hold about you (Art. 15).</li>
            <li><strong className="text-hi">Rectification</strong> — correct inaccurate data (Art. 16).</li>
            <li><strong className="text-hi">Erasure</strong> — request deletion of your data (&ldquo;right to be forgotten&rdquo;, Art. 17).</li>
            <li><strong className="text-hi">Restriction</strong> — restrict processing in certain circumstances (Art. 18).</li>
            <li><strong className="text-hi">Portability</strong> — receive your data in a machine-readable format (Art. 20).</li>
            <li><strong className="text-hi">Objection</strong> — object to processing based on legitimate interests (Art. 21).</li>
            <li><strong className="text-hi">Withdraw consent</strong> — withdraw cookie consent at any time without affecting prior lawful processing.</li>
          </ul>
          <p className="mt-3">
            To exercise any right, email{' '}
            <a href="mailto:hello@videsaur.co.in" className="text-hi hover:text-volt">
              hello@videsaur.co.in
            </a>{' '}
            with &ldquo;GDPR Request&rdquo; in the subject line. We respond within 30 days.
          </p>
        </PolicySection>

        <PolicySection heading="Your Rights (CCPA — California Residents)">
          <p className="mb-3">
            California residents have the right to:
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-mid">
            <li>Know what personal information we collect and how it is used.</li>
            <li>Delete personal information we have collected (with some exceptions).</li>
            <li>Opt out of the sale of personal information. We do <strong className="text-hi">not</strong> sell personal information.</li>
            <li>Non-discrimination for exercising your CCPA rights.</li>
          </ul>
          <p className="mt-3">
            To submit a CCPA request, email{' '}
            <a href="mailto:hello@videsaur.co.in" className="text-hi hover:text-volt">
              hello@videsaur.co.in
            </a>{' '}
            with &ldquo;CCPA Request&rdquo; in the subject line.
          </p>
        </PolicySection>

        <PolicySection heading="Third-Party Links">
          <p>
            Our site may link to external websites. We are not responsible for the privacy practices
            of those sites. Review their privacy policies before submitting any personal data.
          </p>
        </PolicySection>

        <PolicySection heading="Children's Privacy">
          <p>
            Videsaur is not directed at children under 13 (or 16 where applicable under GDPR). We
            do not knowingly collect data from children. If you believe a child has provided us with
            personal information, contact us and we will delete it promptly.
          </p>
        </PolicySection>

        <PolicySection heading="Changes to This Policy">
          <p>
            We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the
            top of this page reflects the most recent revision. Continued use of the site after
            changes constitutes acceptance of the revised policy.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
