import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms of Service — Videsaur"
        description="Videsaur Terms of Service. Understand the license terms, acceptable use policy, DMCA procedure, and limitations of liability for using our meme download service."
        canonicalPath="/terms"
      />
      <PolicyLayout title="Terms of Service" breadcrumb="Terms of Service" lastUpdated="27 August 2026">
        <PolicySection heading="Acceptance of Terms">
          <p>
            By accessing or using <strong>videsaur.co.in</strong> (&ldquo;the Site&rdquo;), you
            agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree,
            do not use the Site. We may revise these Terms at any time; your continued use
            constitutes acceptance of any changes.
          </p>
        </PolicySection>

        <PolicySection heading="Content Licences">
          <p className="mb-3">
            Assets on the Site are available under one of two licence types, clearly labelled on
            each asset page:
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border border-edge bg-panel p-4">
              <p className="font-semibold text-hi">CC0 — Public Domain</p>
              <p className="mt-1 text-sm text-mid">
                The creator has waived all copyright and related rights worldwide. You may copy,
                modify, distribute, and perform the work, even for commercial purposes, without
                asking permission or giving attribution (though attribution is appreciated).
              </p>
            </div>
            <div className="rounded-xl border border-edge bg-panel p-4">
              <p className="font-semibold text-hi">Editorial — Non-Commercial / Transformative Use</p>
              <p className="mt-1 text-sm text-mid">
                These assets are shared for commentary, criticism, parody, and fan use under fair
                dealing / fair use principles. Commercial reproduction, resale, or use in monetised
                content without transformation is not permitted. When in doubt, use CC0 assets.
              </p>
            </div>
          </div>
          <p className="mt-3">
            Videsaur does not own or guarantee the underlying intellectual property of any
            user-submitted asset. It is your responsibility to verify the licence before any
            commercial or monetised use.
          </p>
        </PolicySection>

        <PolicySection heading="Acceptable Use">
          <p className="mb-3">You agree not to use the Site to:</p>
          <ul className="list-inside list-disc space-y-1.5 text-mid">
            <li>Upload, share, or distribute content you do not have the right to distribute.</li>
            <li>Infringe any copyright, trade mark, patent, or other intellectual property right.</li>
            <li>Upload sexually explicit, hateful, harassing, or illegal content.</li>
            <li>Attempt to access any part of the service through automated means (scraping, bots) that place unreasonable load on our servers.</li>
            <li>Circumvent any technical measures designed to restrict access or protect content.</li>
            <li>Engage in any conduct that violates applicable law.</li>
          </ul>
          <p className="mt-3">
            We reserve the right to remove content and suspend accounts that violate these rules,
            without prior notice.
          </p>
        </PolicySection>

        <PolicySection heading="User-Submitted Content">
          <p>
            When you upload content to Videsaur, you represent and warrant that you own the
            necessary rights or have obtained all required permissions. By submitting content, you
            grant Videsaur a worldwide, royalty-free, non-exclusive licence to display, distribute,
            and promote that content on the Site and in associated marketing.
          </p>
        </PolicySection>

        <PolicySection heading="DMCA / Copyright Complaints">
          <p>
            If you believe content on the Site infringes your copyright, send a takedown notice to{' '}
            <a href="mailto:dmca@videsaur.co.in" className="text-hi hover:text-brand">
              dmca@videsaur.co.in
            </a>
            . See our{' '}
            <a href="/content-policy" className="text-hi underline underline-offset-2 hover:text-brand">
              Content &amp; DMCA Policy
            </a>{' '}
            for the full procedure and what information to include. We respond to valid notices
            within 24–48 hours.
          </p>
        </PolicySection>

        <PolicySection heading="Advertising">
          <p>
            The Site displays advertisements provided by Google AdSense and possibly other ad
            networks. Advertisements are clearly labelled &ldquo;Advertisement&rdquo;. We are not
            responsible for the content of third-party advertisements. AdSense interest-based
            advertising requires your consent, which you can grant or withdraw via our cookie banner.
          </p>
        </PolicySection>

        <PolicySection heading="Disclaimer of Warranties">
          <p>
            The Site and all content are provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranty of any kind, express or implied, including warranties
            of merchantability, fitness for a particular purpose, or non-infringement. We do not
            warrant that the Site will be uninterrupted or error-free.
          </p>
        </PolicySection>

        <PolicySection heading="Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, Videsaur and its operators shall not
            be liable for any indirect, incidental, special, consequential, or punitive damages
            arising from your use of or inability to use the Site, even if we have been advised of
            the possibility of such damages. Our total liability for any claim shall not exceed
            ₹1,000 INR (or the equivalent in your local currency).
          </p>
        </PolicySection>

        <PolicySection heading="Governing Law & Dispute Resolution">
          <p>
            These Terms are governed by the laws of India. Any disputes arising under these Terms
            shall first be addressed through good-faith negotiation. If unresolved within 30 days,
            disputes shall be submitted to the courts of Chennai, Tamil Nadu, India. If you are
            located in the EU or UK, you may also contact your local data protection authority.
          </p>
        </PolicySection>

        <PolicySection heading="Contact">
          <p>
            Questions about these Terms? Email{' '}
            <a href="mailto:hello@videsaur.co.in" className="text-hi hover:text-brand">
              hello@videsaur.co.in
            </a>
            .
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
