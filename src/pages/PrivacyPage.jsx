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
      <PolicyLayout title="Privacy Policy" breadcrumb="Privacy Policy" lastUpdated="7 September 2026">
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

        <PolicySection heading="5. Advertising and Third-Party Partners">
          <p className="mb-3">
            We use third-party advertising companies to serve ads when you visit our website.
            These companies may use information about your visits to this and other websites in
            order to provide advertisements about goods and services of interest to you.
          </p>
          <p className="mb-3 font-semibold text-hi">5.1 Advertising Partners</p>
          <p>
            We may also partner with other third-party ad networks and exchanges to display
            advertising on our website. These partners may use cookies and similar technologies
            to collect information about your browsing activities over time and across different
            websites.
          </p>
          <p className="mt-3">
            For more information about how these advertising partners collect and use data, please
            review their respective privacy policies. You can learn more about online advertising
            and opt-out options at the{' '}
            <a
              href="https://optout.networkadvertising.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hi underline underline-offset-2 hover:text-brand"
            >
              Network Advertising Initiative
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

        <PolicySection heading="8. Your Rights">
          <p className="mb-3">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Access to your personal data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Objection to processing</li>
            <li>Data portability</li>
            <li>Withdrawal of consent</li>
            <li>Opt out of personalized advertising</li>
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

        <PolicySection heading="12. Contact Us">
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
