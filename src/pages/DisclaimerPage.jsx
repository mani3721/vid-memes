import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function DisclaimerPage() {
  return (
    <>
      <SEO
        title="Disclaimer — Videsaur.co.in"
        description="Read the Videsaur.co.in disclaimer regarding the use of content, limitations of liability, and third-party links."
        canonicalPath="/disclaimer"
      />
      <PolicyLayout title="Disclaimer" breadcrumb="Disclaimer" lastUpdated="7 September 2026">
        <PolicySection heading="1. General Information">
          <p className="mb-3">
            The information on this website (Videsaur.co.in) is provided on an &ldquo;as
            is&rdquo; basis. To the fullest extent permitted by law, this Company:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Excludes all representations and warranties relating to this website and its contents</li>
            <li>Excludes all liability for damages arising out of or in connection with your use of this website</li>
            <li>Does not warrant that the website will be available at all times or that the information is complete, accurate, or up-to-date</li>
          </ul>
        </PolicySection>

        <PolicySection heading="2. Content Disclaimer">
          <p className="mb-3">
            The content on Videsaur.co.in is provided for entertainment and informational
            purposes only. We do not:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Guarantee the accuracy, completeness, or usefulness of any content</li>
            <li>Endorse or assume responsibility for any content posted by users</li>
            <li>Warrant that content is free from errors, viruses, or other harmful components</li>
            <li>Take responsibility for the content of external links</li>
          </ul>
        </PolicySection>

        <PolicySection heading="3. User-Generated Content">
          <p>
            Videsaur.co.in may contain user-generated content. We do not review all content
            before it is posted and are not responsible for the content, accuracy, or opinions
            expressed in such content. Users are solely responsible for the content they post.
          </p>
        </PolicySection>

        <PolicySection heading="4. Copyright and Intellectual Property">
          <p>
            While we strive to respect intellectual property rights, Videsaur.co.in may contain
            content that is not owned by us. We do not claim ownership of user-uploaded content.
            If you believe your copyright has been infringed, please refer to our{' '}
            <Link to="/content-policy" className="text-hi underline underline-offset-2 hover:text-brand">
              DMCA Policy
            </Link>{' '}
            for information on how to file a takedown request.
          </p>
        </PolicySection>

        <PolicySection heading="5. Third-Party Links">
          <p>
            Our website may contain links to third-party websites or services that are not owned
            or controlled by Videsaur.co.in. We have no control over, and assume no
            responsibility for, the content, privacy policies, or practices of any third-party
            websites or services.
          </p>
        </PolicySection>

        <PolicySection heading="6. Limitation of Liability">
          <p>
            In no event shall Videsaur.co.in, its directors, employees, partners, agents,
            suppliers, or affiliates, be liable for any indirect, incidental, special,
            consequential, or punitive damages, including without limitation, loss of profits,
            data, use, goodwill, or other intangible losses, resulting from your use of the
            service.
          </p>
        </PolicySection>

        <PolicySection heading="7. No Professional Advice">
          <p>
            The information provided on Videsaur.co.in is for general informational and
            entertainment purposes only and is not intended to be a substitute for professional
            advice. Always seek the advice of qualified professionals regarding any specific
            questions you may have.
          </p>
        </PolicySection>

        <PolicySection heading="8. Changes to Disclaimer">
          <p>
            We reserve the right to modify this disclaimer at any time. We will notify users of
            any changes by posting the new disclaimer on this page and updating the &ldquo;Last
            Updated&rdquo; date.
          </p>
        </PolicySection>

        <PolicySection heading="9. Contact Us">
          <p>
            If you have any questions about this Disclaimer, please contact us at{' '}
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
