import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy — Videsaur.co.in"
        description="Videsaur.co.in Privacy Policy. Learn how we collect, use, disclose, and safeguard your information when you visit our website."
        canonicalPath="/privacy"
      />
      <PolicyLayout title="Privacy Policy" breadcrumb="Privacy Policy" lastUpdated="23 September 2026">
        <PolicySection heading="1. Introduction">
          <p>
            Welcome to Videsaur.co.in. We respect your privacy and are committed to protecting
            your personal data. This privacy policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website and use our services.
          </p>
        </PolicySection>

        <PolicySection heading="2. Information We Collect">
          <p className="mb-3 font-semibold text-hi">2.1 Information You Provide</p>
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-mid">
            <li>Account registration information (username, email address, password)</li>
            <li>Profile information and preferences</li>
            <li>Content you upload, share, or post</li>
            <li>Communications with us (support requests, feedback)</li>
          </ul>
          <p className="mb-3 font-semibold text-hi">2.2 Automatically Collected Information</p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, time spent, clicks, downloads)</li>
            <li>Cookies and similar tracking technologies</li>
            <li>Location data (if permitted)</li>
          </ul>
        </PolicySection>

        <PolicySection heading="3. How We Use Your Information">
          <p className="mb-3">We use the collected information for various purposes:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>To provide, maintain, and improve our services</li>
            <li>To process your requests and transactions</li>
            <li>To personalize your experience</li>
            <li>To communicate with you about our services</li>
            <li>To analyze usage patterns and improve our platform</li>
            <li>To detect, prevent, and address technical issues</li>
            <li>To comply with legal obligations</li>
          </ul>
        </PolicySection>

        <PolicySection heading="4. Cookies and Tracking Technologies">
          <p>
            We use cookies and similar tracking technologies to track activity on our website and
            store certain information. You can instruct your browser to refuse all cookies or to
            indicate when a cookie is being sent. However, if you do not accept cookies, you may
            not be able to use some portions of our service.
          </p>
          <p className="mt-3">
            For more detailed information, please see our Cookie Policy.
          </p>
        </PolicySection>

        <PolicySection heading="5. Advertising — Google AdSense &amp; Third-Party Partners">
          <p className="mb-3">
            Videsaur.co.in participates in the <strong className="text-hi">Google AdSense</strong>{' '}
            advertising programme, operated by <strong className="text-hi">Google LLC</strong>,
            1600 Amphitheatre Parkway, Mountain View, CA 94043, USA (&ldquo;Google&rdquo;).
            Google AdSense uses advertising cookies to serve personalised ads on our site based on
            your prior visits to our website or other websites on the Internet.
          </p>

          <p className="mb-3 font-semibold text-hi">5.1 Google DoubleClick DART Cookie</p>
          <p className="mb-3">
            Google, as a third-party advertising vendor, uses the DoubleClick DART cookie to serve
            ads to visitors of Videsaur.co.in based on their visits to this site and other websites
            on the Internet. The DART cookie enables Google and its partners to serve ads based on
            a user&rsquo;s visit to our site and/or other sites on the Internet. Users may opt out
            of the use of the DART cookie by visiting Google&rsquo;s ad and content network
            privacy policy:{' '}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline underline-offset-2 hover:text-brand"
            >
              policies.google.com/technologies/ads
            </a>
            .
          </p>

          <p className="mb-3 font-semibold text-hi">5.2 Cookies Used by Google AdSense</p>
          <p className="mb-3">
            Google AdSense sets the following cookie categories on your device when you visit
            our site:
          </p>
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-mid">
            <li>
              <strong className="text-hi">Advertising cookies</strong> — used to build a profile of
              your interests and show you relevant ads on other sites (e.g., <code>IDE</code>,{' '}
              <code>DSID</code>, <code>FLC</code>).
            </li>
            <li>
              <strong className="text-hi">Analytics cookies</strong> — used to count visits and
              traffic sources so Google can measure and improve ad performance.
            </li>
            <li>
              <strong className="text-hi">Functional cookies</strong> — used to remember choices
              you have made (e.g., consent preferences).
            </li>
          </ul>
          <p className="mb-3">
            For a complete list of cookies used by Google, see{' '}
            <a
              href="https://policies.google.com/technologies/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline underline-offset-2 hover:text-brand"
            >
              policies.google.com/technologies/cookies
            </a>
            .
          </p>

          <p className="mb-3 font-semibold text-hi">5.3 Opting Out of Personalised Advertising</p>
          <p className="mb-3">
            You may opt out of personalised advertising served by Google by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline underline-offset-2 hover:text-brand"
            >
              Google Ad Settings
            </a>
            . You can also opt out of third-party vendor use of cookies for personalised
            advertising by visiting{' '}
            <a
              href="https://optout.networkadvertising.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline underline-offset-2 hover:text-brand"
            >
              optout.networkadvertising.org
            </a>
            {' '}or{' '}
            <a
              href="https://optout.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline underline-offset-2 hover:text-brand"
            >
              optout.aboutads.info
            </a>
            . When you opt out, you will still see ads, but they will not be personalised based
            on your interests.
          </p>
          <p>
            For full details on how Google collects and uses data from our site, see{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline underline-offset-2 hover:text-brand"
            >
              Google&rsquo;s Privacy Policy
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection heading="6. Data Sharing and Disclosure">
          <p className="mb-3">We may share your information in the following circumstances:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>With service providers who assist in operating our platform</li>
            <li>With advertising partners to serve relevant advertisements (see Section 5)</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transfer or merger</li>
            <li>With your consent or at your direction</li>
          </ul>
        </PolicySection>

        <PolicySection heading="7. Data Security">
          <p>
            We implement appropriate technical and organizational measures to protect your
            personal information. However, no method of transmission over the Internet or
            electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </PolicySection>

        <PolicySection heading="8. Your Rights (General)">
          <p className="mb-3">
            Depending on your location, you may have the following rights regarding your personal
            data. Specific rights for EU/EEA residents (GDPR) and California residents (CCPA) are
            detailed in Sections 13 and 14 respectively.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Access to your personal data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Objection to processing</li>
            <li>Data portability</li>
            <li>Withdrawal of consent</li>
            <li>Opt out of personalised advertising</li>
          </ul>
        </PolicySection>

        <PolicySection heading="9. Children's Privacy">
          <p>
            Our service is not intended for children under the age of 13. We do not knowingly
            collect personal information from children under 13. If you are a parent or guardian
            and believe your child has provided us with personal information, please contact us.
          </p>
        </PolicySection>

        <PolicySection heading="10. International Data Transfers">
          <p>
            Your information may be transferred to and processed in countries other than your
            own. These countries may have different data protection laws. By using our service,
            you consent to the transfer of your information to these countries.
          </p>
        </PolicySection>

        <PolicySection heading="11. Changes to This Privacy Policy">
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the
            &ldquo;Last Updated&rdquo; date.
          </p>
        </PolicySection>

        <PolicySection heading="12. European Users — GDPR Rights">
          <p className="mb-3">
            If you are located in the European Union, European Economic Area (EEA), or the United
            Kingdom, the following rights apply to you under the{' '}
            <strong className="text-hi">General Data Protection Regulation (GDPR)</strong> and
            applicable UK data protection law. Our legal bases for processing your personal data
            are: (a) your consent (e.g., advertising cookies); (b) performance of a contract;
            (c) compliance with a legal obligation; and (d) our legitimate interests.
          </p>
          <p className="mb-3 font-semibold text-hi">Your GDPR Rights</p>
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-mid">
            <li>
              <strong className="text-hi">Right of access (Art. 15)</strong> — you may request a
              copy of the personal data we hold about you.
            </li>
            <li>
              <strong className="text-hi">Right to rectification (Art. 16)</strong> — you may ask
              us to correct inaccurate or incomplete data.
            </li>
            <li>
              <strong className="text-hi">Right to erasure (Art. 17)</strong> — you may ask us to
              delete your personal data under certain circumstances (&ldquo;right to be
              forgotten&rdquo;).
            </li>
            <li>
              <strong className="text-hi">Right to restriction of processing (Art. 18)</strong>{' '}
              — you may ask us to limit how we use your data.
            </li>
            <li>
              <strong className="text-hi">Right to data portability (Art. 20)</strong> — you may
              receive your data in a structured, commonly used format.
            </li>
            <li>
              <strong className="text-hi">Right to object (Art. 21)</strong> — you may object to
              processing based on legitimate interests or for direct marketing, including
              profiling for ad targeting.
            </li>
            <li>
              <strong className="text-hi">Right to withdraw consent</strong> — where we process
              data based on consent, you may withdraw it at any time by adjusting your cookie
              preferences or contacting us directly.
            </li>
          </ul>
          <p className="mb-3">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:support@videsaur.co.in" className="text-hi underline underline-offset-2 hover:text-brand">
              support@videsaur.co.in
            </a>
            . We will respond within 30 days. If you believe your rights have not been upheld,
            you have the right to lodge a complaint with your local data protection authority
            (e.g., the ICO in the UK or the relevant supervisory authority in your EU member state).
          </p>
          <p>
            Note: because we use Google AdSense, data about your ad interactions may be processed
            by Google LLC in the United States under Standard Contractual Clauses approved by the
            European Commission. For details, see{' '}
            <a
              href="https://privacy.google.com/businesses/processorterms/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline underline-offset-2 hover:text-brand"
            >
              Google&rsquo;s Data Processing Terms
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection heading="13. California Residents — CCPA / CPRA Rights">
          <p className="mb-3">
            If you are a California resident, you have rights under the{' '}
            <strong className="text-hi">California Consumer Privacy Act (CCPA)</strong> as
            amended by the{' '}
            <strong className="text-hi">California Privacy Rights Act (CPRA)</strong>. We do not
            sell your personal information for monetary consideration. However, sharing data with
            advertising partners (such as Google AdSense) for cross-context behavioural advertising
            may constitute a &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; under California law.
          </p>
          <p className="mb-3 font-semibold text-hi">Categories of Personal Information We Collect</p>
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-mid">
            <li>Identifiers (IP address, account email, username)</li>
            <li>Internet or other electronic network activity (browsing history, pages visited)</li>
            <li>Commercial information (download history)</li>
            <li>Inferences drawn from the above to create a profile for advertising purposes</li>
          </ul>
          <p className="mb-3 font-semibold text-hi">Your CCPA / CPRA Rights</p>
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-mid">
            <li>
              <strong className="text-hi">Right to Know</strong> — you may request disclosure of
              the categories and specific pieces of personal information we have collected about
              you in the past 12 months.
            </li>
            <li>
              <strong className="text-hi">Right to Delete</strong> — you may request deletion of
              your personal information, subject to certain exceptions.
            </li>
            <li>
              <strong className="text-hi">Right to Correct</strong> — you may request that we
              correct inaccurate personal information.
            </li>
            <li>
              <strong className="text-hi">Right to Opt-Out of Sale / Sharing</strong> — you may
              direct us to stop sharing your personal information for cross-context behavioural
              advertising. To opt out, adjust your cookie preferences via our consent banner or
              click &ldquo;Do Not Sell or Share My Personal Information&rdquo; in our Cookie
              Policy.
            </li>
            <li>
              <strong className="text-hi">Right to Non-Discrimination</strong> — we will not
              discriminate against you for exercising any of your CCPA / CPRA rights.
            </li>
            <li>
              <strong className="text-hi">Right to Limit Use of Sensitive Personal
              Information</strong> — we do not collect sensitive personal information as defined
              by the CPRA.
            </li>
          </ul>
          <p>
            To submit a verifiable consumer request, contact us at{' '}
            <a href="mailto:support@videsaur.co.in" className="text-hi underline underline-offset-2 hover:text-brand">
              support@videsaur.co.in
            </a>{' '}
            with the subject line &ldquo;CCPA Request&rdquo;. We will respond within 45 days.
            You may also designate an authorised agent to submit requests on your behalf.
          </p>
        </PolicySection>

        <PolicySection heading="14. Contact Us">
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@videsaur.co.in" className="text-hi underline underline-offset-2 hover:text-brand">
              support@videsaur.co.in
            </a>{' '}
            or visit our{' '}
            <Link to="/contact" className="text-hi underline underline-offset-2 hover:text-brand">
              Contact Us
            </Link>{' '}
            page.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
