import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

const linkClass = 'text-hi underline underline-offset-2 hover:text-brand'
const listClass = 'list-disc space-y-1.5 pl-5 text-mid'

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms of Use — Videsaur.co.in"
        description="Review the Videsaur Terms of Use, including media asset licensing, acceptable use, intellectual property, account, and liability terms."
        canonicalPath="/terms"
      />
      <PolicyLayout title="Terms of Use" lastUpdated="October 8, 2026">
        <PolicySection heading="1. Acceptance of Terms">
          <p>
            By accessing, browsing, or utilizing the media asset repositories, soundboards,
            templates, and curation tools provided via <strong>Videsaur.co.in</strong> (the
            &ldquo;Platform&rdquo; or &ldquo;Service&rdquo;), you acknowledge that you have read,
            understood, and unconditionally agree to be legally bound by these Terms of Use, our{' '}
            <Link to="/privacy" className={linkClass}>Privacy Policy</Link>, and our operational
            guidelines. If you do not agree to comply with or abide by these terms, you are
            explicitly prohibited from using the Platform and must terminate your session
            immediately.
          </p>
        </PolicySection>

        <PolicySection heading="2. Permitted Curation & Media Asset Usage License">
          <p>
            Videsaur operates as an open-access utility repository designed to assist social
            media managers, video producers, independent stream editors, and digital creators.
            Content items available on the Platform—including short-form reaction video tracks,
            loopable animation assets, blank design canvas structures, and sound effects—are
            curated to be integrated into broader, transformative creative projects.
          </p>
          <p>
            Under this functional asset license, you are permitted to extract, download, and
            utilize media elements for mixed-media editing and design generation. However, this
            grant represents a limited usage allowance, not a transfer of underlying title or
            copyright ownership. Under this license, you explicitly agree that you shall not:
          </p>
          <ul className={listClass}>
            <li>Sell, redistribute for standalone profit, sublicense, or commercially monetize raw, unedited, or non-transformed media files as standalone asset packages.</li>
            <li>Deploy automated scraping engines, heavy bot loops, or systemic data-mining software to scrape the entire database layout or mass-download thousands of structural paths simultaneously without administrative authorization.</li>
            <li>Attempt to decompile, reverse-engineer, or disrupt the underlying client-side source code, Vite layout scripts, styling modules, or database ingestion endpoints running on our Vercel network framework.</li>
            <li>Mirror the compiled index files or dynamic application wrappers on external servers to replicate the Platform&apos;s utility service layout.</li>
          </ul>
        </PolicySection>

        <PolicySection heading="3. User Account Protocols">
          <p>
            While basic media extractions and repository browsing require zero platform
            authentication or registration steps, advanced features or creator utility modules
            may require the activation of a user profile. If you initialize an account grid
            setup, you guarantee that all metrics provided are:
          </p>
          <ul className={listClass}>
            <li>Authentic, complete, and completely accurate.</li>
            <li>Void of misleading tags or fraudulent identity statements.</li>
            <li>Compliant with all applicable regional and national data validation structures.</li>
          </ul>
          <p>
            You maintain ultimate responsibility for securing your account access credentials
            and hashes. Videsaur cannot be held liable for losses or security gaps caused by
            insecure configuration settings or the compromise of local device profiles.
          </p>
        </PolicySection>

        <PolicySection heading="4. User-Generated Submissions & Context Licensing">
          <p>
            Publishers and community contributors may retain the ability to upload, comment on,
            or index media configurations across our active grids. You retain all underlying
            property title protections for raw media clips you submit to our portal. However, by
            uploading content files into our infrastructure loops, you grant Videsaur an
            unrestricted, non-exclusive, royalty-free, worldwide license to host, render,
            archive, categorize, and showcase the asset text strings to support our operational
            discovery funnels.
          </p>
          <p>
            You explicitly affirm that you possess all necessary licensing clearances, copyright
            paths, and authorizations before dropping media elements into our moderation queue,
            and assume total accountability if uploaded materials conflict with third-party
            intellectual properties.
          </p>
        </PolicySection>

        <PolicySection heading="5. Forbidden System Practices">
          <p>To preserve network infrastructure integrity and clear security parameters, you agree not to use the Service to:</p>
          <ul className={listClass}>
            <li>Distribute, link to, or upload files containing malicious software viruses, Trojan codes, or destructive server load scripts.</li>
            <li>Impersonate platform administrators, authors, or corporate content creators to spoof system affiliations.</li>
            <li>Interfere with or break the operational network threads running between our frontend assets and our backend cloud database architecture.</li>
            <li>Harvest or mine tracking statistics about other creators or platform visitors without explicit permission.</li>
          </ul>
        </PolicySection>

        <PolicySection heading="6. Intellectual Property & Safe Harbor Standings">
          <p>
            The original software wrappers, visual layouts, text compliance blocks, font
            metrics, and branding components built natively by Videsaur are protected under
            global copyright, trademark, and web-design framework laws. The specific video
            reactions, sound cuts, and pop-culture templates indexed across our library represent
            community artifacts, public domain creations, or licensed transformative materials
            curated under statutory <strong>Fair Use</strong> parameters.
          </p>
          <p>
            We operate as a compliant safe-harbor indexer. If an asset is flagged for trademark
            conflicts or explicit copyright breaches, our removal workflow responds immediately
            upon receiving a valid notification via our official{' '}
            <Link to="/content-policy" className={linkClass}>DMCA Policy</Link> channel.
          </p>
        </PolicySection>

        <PolicySection heading="7. Disclaimer of Warranties">
          <p>
            The media assets and infrastructure elements showcased on Videsaur are provided
            strictly on an <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as
            available&rdquo;</strong> operational baseline. Videsaur makes no direct or implied
            warranties, and explicitly negates all other claims including, without limitation,
            implied conditions of merchantability, file fitness for specific production edits,
            or non-infringement of external copyright matrices. For comprehensive coverage
            information, please refer directly to our dedicated{' '}
            <Link to="/disclaimer" className={linkClass}>Disclaimer</Link> page.
          </p>
        </PolicySection>

        <PolicySection heading="8. Statutory Limitation of Liability">
          <p>
            In no scenario shall Videsaur, its administrative staff, or its data layer suppliers
            be held legally liable for any downstream operational damages (including, without
            limitation, network fees, loss of editing data, project profit drops, or project
            interruptions) resulting directly from the utilization or inability to extract
            materials from our grids—even if a corporate representative has been alerted to the
            potential for such disruptions.
          </p>
        </PolicySection>

        <PolicySection heading="9. Administrative Termination Rights">
          <p>
            We retain the absolute right to suspend, terminate, or completely restrict access to
            our user accounts, advanced creation panels, or system routes immediately, without
            prior notice or legal liability, for any operational variance, including without
            limitation if you breach the conditions laid out inside these Terms.
          </p>
        </PolicySection>

        <PolicySection heading="10. Structural Term Modifications">
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms of Use
            at any time. Material revisions will be identified by updating the date shown at the
            top of this page. Your continued use of the Platform after revised terms take effect
            constitutes acceptance of those changes.
          </p>
        </PolicySection>

        <PolicySection heading="11. Contact Information">
          <p>
            If you have questions about these Terms of Use, email{' '}
            <a href="mailto:support@videsaur.co.in" className={linkClass}>support@videsaur.co.in</a>{' '}
            or visit our <Link to="/contact" className={linkClass}>Contact Us</Link> page.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
