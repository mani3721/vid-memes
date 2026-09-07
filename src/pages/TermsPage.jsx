import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms and Conditions — Videsaur.co.in"
        description="Videsaur.co.in Terms and Conditions. Understand the license terms, acceptable use policy, and limitations of liability for using our service."
        canonicalPath="/terms"
      />
      <PolicyLayout title="Terms and Conditions" breadcrumb="Terms and Conditions" lastUpdated="7 September 2026">
        <PolicySection heading="1. Acceptance of Terms">
          <p>
            By accessing and using Videsaur.co.in, you accept and agree to be bound by the
            terms and provision of this agreement. If you do not agree to abide by the above,
            please do not use this service.
          </p>
        </PolicySection>

        <PolicySection heading="2. Use License">
          <p className="mb-3">
            Permission is granted to temporarily access the materials on Videsaur.co.in for
            personal, non-commercial transitory viewing only. This is the grant of a license,
            not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or &ldquo;mirror&rdquo; the materials on any other server</li>
          </ul>
        </PolicySection>

        <PolicySection heading="3. User Accounts">
          <p className="mb-3">
            When you create an account with us, you must provide information that is:
          </p>
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-mid">
            <li>Accurate, complete, and current</li>
            <li>Not misleading or fraudulent</li>
            <li>In compliance with all applicable laws</li>
          </ul>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account.
          </p>
        </PolicySection>

        <PolicySection heading="4. User Content">
          <p className="mb-3">
            You retain ownership of any content you submit, post, or display on our platform.
            By submitting content, you grant us:
          </p>
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-mid">
            <li>A worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content</li>
            <li>The right to modify, adapt, and create derivative works from your content</li>
            <li>The right to use your content for promotional purposes</li>
          </ul>
          <p>
            You are solely responsible for your content and represent that you have all necessary
            rights to grant us these licenses.
          </p>
        </PolicySection>

        <PolicySection heading="5. Prohibited Activities">
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Upload, post, or transmit any content that is illegal, harmful, or violates any rights</li>
            <li>Impersonate any person or entity or falsely state your affiliation</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Use automated systems to access the service without permission</li>
            <li>Attempt to gain unauthorized access to any portion of the service</li>
            <li>Collect or store personal data about other users without their consent</li>
          </ul>
        </PolicySection>

        <PolicySection heading="6. Intellectual Property">
          <p>
            The service and its original content, features, and functionality are owned by
            Videsaur.co.in and are protected by international copyright, trademark, patent,
            trade secret, and other intellectual property laws.
          </p>
        </PolicySection>

        <PolicySection heading="7. Disclaimer">
          <p className="mb-3">
            The materials on Videsaur.co.in are provided on an &lsquo;as is&rsquo; basis.
            Videsaur.co.in makes no warranties, expressed or implied, and hereby disclaims and
            negates all other warranties including, without limitation, implied warranties or
            conditions of merchantability, fitness for a particular purpose, or non-infringement
            of intellectual property or other violation of rights.
          </p>
          <p>
            For more information, please see our{' '}
            <Link to="/disclaimer" className="text-hi underline underline-offset-2 hover:text-brand">
              Disclaimer
            </Link>{' '}
            page.
          </p>
        </PolicySection>

        <PolicySection heading="8. Limitation of Liability">
          <p>
            In no event shall Videsaur.co.in or its suppliers be liable for any damages
            (including, without limitation, damages for loss of data or profit, or due to
            business interruption) arising out of the use or inability to use the materials on
            Videsaur.co.in, even if Videsaur.co.in or an authorized representative has been
            notified orally or in writing of the possibility of such damage.
          </p>
        </PolicySection>

        <PolicySection heading="9. Termination">
          <p>
            We may terminate or suspend your account and access to the service immediately,
            without prior notice or liability, for any reason whatsoever, including without
            limitation if you breach the Terms.
          </p>
        </PolicySection>

        <PolicySection heading="10. Changes to Terms">
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at
            any time. If a revision is material, we will try to provide at least 30 days notice
            prior to any new terms taking effect.
          </p>
        </PolicySection>

        <PolicySection heading="11. Contact Information">
          <p>
            If you have any questions about these Terms and Conditions, please contact us at{' '}
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
