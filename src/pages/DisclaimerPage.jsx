import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function DisclaimerPage() {
  return (
    <>
      <SEO title="Disclaimer — Videsaur" description="Read our disclaimer regarding the use of Videsaur content." canonicalPath="/disclaimer" />
      <PolicyLayout title="Disclaimer" lastUpdated="August 2026" breadcrumb="Disclaimer">
        <PolicySection heading="General Information">
          <p>The information and media on Videsaur are provided for general entertainment and creative purposes only. We make no warranties about the completeness, reliability, or accuracy of this content.</p>
        </PolicySection>
        <PolicySection heading="No Endorsement">
          <p>Any memes, videos, GIFs, or audio clips available on Videsaur do not represent the views or opinions of Videsaur or its team. We do not endorse any individual, organisation, product, or service depicted in any content available on this platform.</p>
        </PolicySection>
        <PolicySection heading="Third-Party Content">
          <p>Some content on Videsaur may originate from third-party sources. We take DMCA notices seriously and promptly remove infringing content upon verified request. If you believe content infringes your rights, please contact <a href="mailto:dmca@videsaur.co.in" className="text-volt hover:underline">dmca@videsaur.co.in</a>.</p>
        </PolicySection>
        <PolicySection heading="Use at Your Own Risk">
          <p>By using this platform you accept that all downloaded content is used at your own discretion and risk. Videsaur is not liable for any direct or indirect damages arising from your use of content downloaded from the platform.</p>
        </PolicySection>
        <PolicySection heading="Changes">
          <p>We reserve the right to update this disclaimer at any time. Continued use of the platform after changes constitutes your acceptance of the updated disclaimer.</p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
