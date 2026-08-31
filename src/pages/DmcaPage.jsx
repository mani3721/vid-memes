import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function DmcaPage() {
  return (
    <>
      <SEO
        title="Content & DMCA Policy — Videsaur"
        description="Videsaur DMCA and content policy. How to submit a copyright takedown notice, counter-notice process, and our repeat-infringer policy under 17 U.S.C. § 512."
        canonicalPath="/content-policy"
      />
      <PolicyLayout
        title="Content & DMCA Policy"
        breadcrumb="Content Policy"
        lastUpdated="27 August 2026"
      >
        <PolicySection heading="Our Content Standards">
          <p className="mb-3">
            Videsaur is a community-powered meme archive. We are committed to hosting only content
            that respects creators' rights and complies with applicable law. Content on the Site must:
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-mid">
            <li>Be shared under a CC0, fair use, or transformative-use basis.</li>
            <li>Not constitute harassment, hate speech, or incitement to violence.</li>
            <li>Not depict sexual content involving minors.</li>
            <li>Not infringe third-party trade marks or privacy rights without fair-use basis.</li>
          </ul>
          <p className="mt-3">
            We remove non-compliant content promptly upon notice and may ban repeat offenders from
            uploading.
          </p>
        </PolicySection>

        <PolicySection heading="DMCA Takedown Procedure (17 U.S.C. § 512)">
          <p className="mb-3">
            Videsaur complies with the Digital Millennium Copyright Act (DMCA) and equivalent
            legislation in other jurisdictions. If you believe content on the Site infringes your
            copyright, send a written notice to our designated agent:
          </p>
          <div className="rounded-xl border border-edge bg-panel p-4 text-sm">
            <p className="font-semibold text-hi">DMCA Agent</p>
            <p className="mt-1 text-mid">
              Email:{' '}
              <a href="mailto:dmca@videsaur.co.in" className="text-hi hover:text-brand">
                dmca@videsaur.co.in
              </a>
            </p>
          </div>

          <p className="mt-4 mb-2 font-semibold text-hi">Your notice must include:</p>
          <ol className="list-inside list-decimal space-y-1.5 text-mid">
            <li>
              Your physical or electronic signature (or the signature of the person authorised to
              act on behalf of the rights holder).
            </li>
            <li>
              Identification of the copyrighted work claimed to have been infringed (e.g., title,
              registration number, or URL of original work).
            </li>
            <li>
              Identification of the infringing material, with sufficient detail for us to locate it
              (e.g., full URL of the page on videsaur.co.in).
            </li>
            <li>
              Your contact information: name, address, telephone number, and email address.
            </li>
            <li>
              A statement that you have a good-faith belief that use of the material is not
              authorised by the copyright owner, its agent, or the law.
            </li>
            <li>
              A statement, made under penalty of perjury, that the information in your notice is
              accurate and that you are the copyright owner or authorised to act on their behalf.
            </li>
          </ol>
          <p className="mt-3">
            We will process valid notices within <strong className="text-hi">24–48 hours</strong>{' '}
            and remove or disable access to the infringing content. We will also notify the uploader
            where possible.
          </p>
          <p className="mt-2 text-sm text-mid">
            <strong className="text-hi">Warning:</strong> Submitting a knowingly false DMCA
            notice may expose you to liability under 17 U.S.C. § 512(f).
          </p>
        </PolicySection>

        <PolicySection heading="Counter-Notice Procedure">
          <p className="mb-3">
            If you believe your content was removed in error or misidentification, you may send a
            counter-notice to{' '}
            <a href="mailto:dmca@videsaur.co.in" className="text-hi hover:text-brand">
              dmca@videsaur.co.in
            </a>
            . Your counter-notice must include:
          </p>
          <ol className="list-inside list-decimal space-y-1.5 text-mid">
            <li>Your physical or electronic signature.</li>
            <li>Identification of the removed content and its location before removal.</li>
            <li>
              A statement under penalty of perjury that you have a good-faith belief the content was
              removed as a result of mistake or misidentification.
            </li>
            <li>
              Your name, address, and phone number, and a statement that you consent to the
              jurisdiction of the Federal District Court for your judicial district (or, if outside
              the US, the courts of Chennai, Tamil Nadu, India).
            </li>
          </ol>
          <p className="mt-3">
            Upon receiving a valid counter-notice, we will forward it to the original complainant
            and may restore the content within 10–14 business days unless the complainant files a
            court action.
          </p>
        </PolicySection>

        <PolicySection heading="Repeat Infringer Policy">
          <p>
            In accordance with 17 U.S.C. § 512(i), Videsaur maintains a policy of terminating
            accounts of users who are repeat infringers. Accounts that receive three or more
            substantiated DMCA notices within any 12-month period will be permanently suspended
            from upload privileges.
          </p>
        </PolicySection>

        <PolicySection heading="Other Content Reports">
          <p>
            To report content that violates our community standards (hate speech, illegal material,
            privacy violations) rather than copyright, email{' '}
            <a href="mailto:hello@videsaur.co.in" className="text-hi hover:text-brand">
              hello@videsaur.co.in
            </a>{' '}
            with &ldquo;Content Report&rdquo; in the subject line. Include the URL of the content
            and a description of the violation. We review all reports within 5 business days.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
