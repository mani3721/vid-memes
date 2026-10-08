import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function DmcaPage() {
  return (
    <>
      <SEO
        title="DMCA Copyright Policy — Videsaur.co.in"
        description="Review Videsaur.co.in's DMCA Copyright Policy, including takedown notice requirements, counter-notifications, repeat-infringer protocols, and processing times."
        canonicalPath="/content-policy"
      />
      <PolicyLayout
        title="DMCA Copyright Policy"
        breadcrumb="DMCA Copyright Policy"
        lastUpdated="October 8, 2026"
      >
        <PolicySection heading="1. Introduction & Statement of Commitment">
          <p className="mb-3">
            <strong className="text-hi">Videsaur.co.in</strong> (the "Platform") strictly respects
            the intellectual property rights of external content producers, trademark owners, and
            creative artists. In direct compliance with the{' '}
            <strong className="text-hi">Digital Millennium Copyright Act (DMCA)</strong> of 1998,
            specifically 17 U.S.C. § 512, we maintain an expedited, formalized protocol to address
            and clear legitimate claims of alleged copyright infringement.
          </p>
          <p>
            As a digital repository and curation index mapping pop-culture media elements, viral
            short-form loops, and open-access audio tracks, our system functions as an automated
            service provider hosting user-shared and community-contributed materials inside
            established Fair Use frameworks. We expect our active user base to respect these
            intellectual property standards. Videsaur will swiftly terminate system access and
            remove hosted elements if an administrative notice details a verified license violation.
          </p>
        </PolicySection>

        <PolicySection heading="2. Filing a Formal Notice of Copyright Infringement">
          <p className="mb-3">
            If you are a copyright owner, or an authorized corporate representative acting on behalf
            of a rights holder, and you identify any media asset or text string indexed across our
            active channels that you believe infringes upon your exclusive rights, you may submit a
            formal written notification. To ensure statutory processing validity under 17 U.S.C.
            § 512(c)(3), your DMCA Takedown Notice must include the following precise elements:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>A physical or electronic signature of the individual legally authorized to act on behalf of the owner of the exclusive right that is allegedly infringed.</li>
            <li>Explicit identification of the copyrighted work or registered artistic creation claimed to have been infringed (or, if multiple works across our grids are covered by a single notice, a comprehensive list of those assets).</li>
            <li>Identification of the specific material, thumbnail file, video track, or audio wave claimed to be infringing. This must include information reasonably sufficient to allow our engineering team to locate the asset (such as the direct dynamic URL: <code className="text-hi">https://videsaur.co.in[slug]</code>).</li>
            <li>Your direct contact metrics, including a valid mailing address, a functional telephone number, and an active business email address.</li>
            <li>A formal statement that you maintain a good-faith belief that utilization of the targeted material in the manner complained of is not authorized by the copyright owner, its legal agent, or statutory law.</li>
            <li>A statement that the data elements mapped out in the notification are entirely accurate, and, under penalty of perjury, that you are the rightful copyright holder or are legally authorized to act on behalf of the owner.</li>
          </ul>
        </PolicySection>

        <PolicySection heading="3. Designated Copyright Agent Contact">
          <p className="mb-3">
            All formal copyright remediation declarations and structural DMCA Takedown Notices must
            be directed to our designated agent via our secure compliance portal:
          </p>
          <div className="rounded-xl border border-edge bg-panel p-4 text-sm">
            <p className="font-semibold text-hi">Copyright Administration Agent — Videsaur.co.in</p>
            <p className="mt-1 text-mid">
              <strong className="text-hi">Email Endpoint:</strong>{' '}
              <a href="mailto:support@videsaur.co.in" className="text-hi underline underline-offset-2 hover:text-brand">
                support@videsaur.co.in
              </a>
            </p>
            <p className="mt-1 text-mid">
              <strong className="text-hi">Mandatory Subject Line:</strong> DMCA Takedown Request — [Asset ID/Name]
            </p>
          </div>
          <p className="mt-3 text-sm italic text-mid">
            Note: Communications sent to this endpoint that do not contain a valid copyright claim
            template may be automatically filtered out by our network routers.
          </p>
        </PolicySection>

        <PolicySection heading="4. Counter-Notification Framework">
          <p className="mb-3">
            If your user profile or submitted asset layout has been modified or removed via a DMCA
            takedown loop, and you maintain that the targeted asset was flagged due to an error,
            misidentification, or fits a protected Fair Use allocation, you may file a formal
            Counter-Notification. Your written response must include the following statutory properties:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Your physical or verified electronic signature.</li>
            <li>Identification of the specific media asset that was removed or disabled, alongside its exact repository routing path prior to deletion.</li>
            <li>A formal statement under penalty of perjury that you possess a good-faith belief that the content was hidden or disabled as a result of mistake or misidentification.</li>
            <li>Your legal name, operating address, and telephone number.</li>
            <li>A statement that you consent to the jurisdiction of the federal court district in which your address is located (or, if you reside outside the United States, that you consent to the jurisdiction of the judicial district where Videsaur's data hosting servers sit), and that you will accept service of process from the original claimant.</li>
          </ul>
        </PolicySection>

        <PolicySection heading="5. Repeat Infringer Termination Protocols">
          <p>
            In accordance with the mandatory provisions of the DMCA, Videsaur enforces a strict,
            automated <strong className="text-hi">Repeat Infringer Policy</strong>. If a community
            profile or contributor layout accumulates multiple independent copyright strikes or is
            found to repeatedly upload unlicensed commercial materials outside of transformative
            Fair Use parameters, our administration tools will completely disable the account,
            invalidate associated API access tokens, and issue a permanent network IP block.
          </p>
        </PolicySection>

        <PolicySection heading="6. Legal Protections Against Fraudulent Claims">
          <p>
            Please be actively aware that under <strong className="text-hi">17 U.S.C. § 512(f)</strong>,
            any individual who knowingly and materially misrepresents that a file or active online
            service is infringing your copyright can be held strictly liable for civil financial
            damages. This includes legal fees, administrative costs, and project disruption penalties
            incurred by the Platform or the targeted creator. If you are uncertain whether the asset
            actually compromises your legal trademark boundaries, consult with a qualified
            intellectual property attorney before filing a notice.
          </p>
        </PolicySection>

        <PolicySection heading="7. Processing Windows & SLA">
          <p>
            Upon receiving an unreserved, legally valid DMCA notification, our moderation team
            executes rapid remediation sweeps. Under our standard operational Service Level Agreement
            (SLA), assets satisfying removal metrics are hidden or disabled within a{' '}
            <strong className="text-hi">48 to 72-hour processing window</strong>. Complex claims or
            multi-asset queries may require additional validation queues.
          </p>
        </PolicySection>

        <div className="border-t border-edge pt-5 text-center text-mid">
          <p>
            For administrative follow-ups, regulatory compliance status, or related intellectual
            property inquiries, reach our development office directly at:{' '}
            <a href="mailto:support@videsaur.co.in" className="font-semibold text-hi underline underline-offset-2 hover:text-brand">
              support@videsaur.co.in
            </a>.
          </p>
        </div>
      </PolicyLayout>
    </>
  )
}
