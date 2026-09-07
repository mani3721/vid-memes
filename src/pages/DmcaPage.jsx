import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function DmcaPage() {
  return (
    <>
      <SEO
        title="DMCA Policy — Videsaur.co.in"
        description="Videsaur.co.in DMCA Policy. How to submit a copyright takedown notice, counter-notice process, and our repeat-infringer policy."
        canonicalPath="/content-policy"
      />
      <PolicyLayout
        title="DMCA Policy"
        breadcrumb="DMCA Policy"
        lastUpdated="7 September 2026"
      >
        <PolicySection heading="1. Introduction">
          <p>
            Videsaur.co.in respects the intellectual property rights of others and expects its
            users to do the same. In accordance with the Digital Millennium Copyright Act
            (DMCA), we have adopted a policy to respond to clear notices of alleged copyright
            infringement.
          </p>
        </PolicySection>

        <PolicySection heading="2. Reporting Copyright Infringement">
          <p className="mb-3">
            If you believe that content on Videsaur.co.in infringes your copyright, please
            provide our Copyright Agent with the following information in writing:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner</li>
            <li>Identification of the copyrighted work claimed to have been infringed</li>
            <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to permit us to locate the material</li>
            <li>Your contact information, including address, telephone number, and email address</li>
            <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner</li>
            <li>A statement that the information in the notification is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
          </ul>
        </PolicySection>

        <PolicySection heading="3. Designated Copyright Agent">
          <p className="mb-3">Please send your DMCA takedown notice to:</p>
          <div className="rounded-xl border border-edge bg-panel p-4 text-sm">
            <p className="font-semibold text-hi">Copyright Agent — Videsaur.co.in</p>
            <p className="mt-1 text-mid">
              Email:{' '}
              <a href="mailto:support@videsaur.co.in" className="text-hi hover:text-brand">
                support@videsaur.co.in
              </a>
            </p>
            <p className="mt-1 text-mid">Subject Line: <span className="text-hi">DMCA Takedown Request</span></p>
          </div>
        </PolicySection>

        <PolicySection heading="4. Counter-Notification">
          <p className="mb-3">
            If you believe that your content was removed in error, you may submit a
            counter-notification. Your counter-notification must include:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Your physical or electronic signature</li>
            <li>Identification of the material that has been removed and its location before removal</li>
            <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
            <li>Your name, address, and telephone number</li>
            <li>A statement that you consent to the jurisdiction of the federal court in your district</li>
          </ul>
        </PolicySection>

        <PolicySection heading="5. Repeat Infringers">
          <p>
            It is our policy to terminate, in appropriate circumstances, the accounts of users
            who are repeat infringers of intellectual property rights.
          </p>
        </PolicySection>

        <PolicySection heading="6. False Claims">
          <p>
            Please note that under Section 512(f) of the DMCA, any person who knowingly
            materially misrepresents that material or activity is infringing may be subject to
            liability for damages. Please be sure that you are the actual copyright holder or
            authorized to act on behalf of the copyright owner before submitting a takedown
            notice.
          </p>
        </PolicySection>

        <PolicySection heading="7. Processing Time">
          <p>
            We will review and respond to valid DMCA takedown notices within a reasonable
            timeframe, typically within{' '}
            <strong className="text-hi">48–72 hours</strong> of receipt. However, processing
            times may vary depending on the complexity of the case.
          </p>
        </PolicySection>

        <PolicySection heading="8. Contact Information">
          <p>
            For questions about this DMCA Policy, please contact us at{' '}
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
