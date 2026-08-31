import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function CookiePolicyPage() {
  return (
    <>
      <SEO title="Cookie Policy — Videsaur" description="Learn how Videsaur uses cookies and similar technologies." canonicalPath="/cookie-policy" />
      <PolicyLayout title="Cookie Policy" lastUpdated="August 2026" breadcrumb="Cookie Policy">
        <PolicySection heading="What Are Cookies">
          <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.</p>
        </PolicySection>
        <PolicySection heading="How We Use Cookies">
          <p>Videsaur uses cookies for the following purposes:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><span className="text-hi font-medium">Session cookies</span> — to keep you signed in during your visit.</li>
            <li><span className="text-hi font-medium">Favorites</span> — a server-side session cookie identifies your favorites list without requiring an account.</li>
            <li><span className="text-hi font-medium">Analytics</span> — anonymous usage data to understand how the site is used (if analytics is enabled).</li>
            <li><span className="text-hi font-medium">Advertising</span> — if you have consented, third-party ad partners (Google AdSense) may set cookies to serve relevant ads.</li>
          </ul>
        </PolicySection>
        <PolicySection heading="Managing Cookies">
          <p>You can control cookies through your browser settings. Disabling cookies may affect site functionality such as favorites and sign-in. You can also withdraw your advertising consent at any time via the cookie banner at the bottom of the page.</p>
        </PolicySection>
        <PolicySection heading="Third-Party Cookies">
          <p>We may use Google AdSense, which sets its own cookies. These are governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Google's Privacy Policy</a>.</p>
        </PolicySection>
        <PolicySection heading="Contact">
          <p>Questions about our cookie use? Email <a href="mailto:hello@videsaur.co.in" className="text-brand hover:underline">hello@videsaur.co.in</a>.</p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
