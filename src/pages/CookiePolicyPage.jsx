import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

export default function CookiePolicyPage() {
  return (
    <>
      <SEO
        title="Cookie Policy — Videsaur.co.in"
        description="Learn how Videsaur.co.in uses cookies and similar technologies, and how to manage your cookie preferences."
        canonicalPath="/cookie-policy"
      />
      <PolicyLayout title="Cookie Policy" breadcrumb="Cookie Policy" lastUpdated="7 September 2026">
        <PolicySection heading="1. What Are Cookies?">
          <p>
            Cookies are small text files that are placed on your computer or mobile device when
            you visit a website. They are widely used to make websites work more efficiently and
            provide information to website owners.
          </p>
        </PolicySection>

        <PolicySection heading="2. How We Use Cookies">
          <p className="mb-3">Videsaur.co.in uses cookies for various purposes:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li><strong className="text-hi">Essential Cookies:</strong> Required for the website to function properly</li>
            <li><strong className="text-hi">Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
            <li><strong className="text-hi">Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong className="text-hi">Advertising Cookies:</strong> Used to deliver relevant advertisements</li>
            <li><strong className="text-hi">Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
            <li><strong className="text-hi">Persistent Cookies:</strong> Remain on your device for a set period or until deleted</li>
          </ul>
        </PolicySection>

        <PolicySection heading="3. Types of Cookies We Use">
          <div className="space-y-4">
            <div>
              <p className="mb-1 font-semibold text-hi">3.1 Strictly Necessary Cookies</p>
              <p className="text-mid">
                These cookies are essential for the website to function and cannot be switched
                off. They are usually set in response to actions made by you, such as setting
                privacy preferences or logging in.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-hi">3.2 Performance Cookies</p>
              <p className="text-mid">
                These cookies allow us to count visits and traffic sources so we can measure and
                improve the performance of our site. They help us know which pages are most and
                least popular.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-hi">3.3 Functionality Cookies</p>
              <p className="text-mid">
                These cookies enable the website to provide enhanced functionality and
                personalization. They may be set by us or by third-party providers whose
                services we have added to our pages.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-hi">3.4 Targeting / Advertising Cookies</p>
              <p className="text-mid">
                These cookies may be set through our site by our advertising partners. They may
                be used to build a profile of your interests and show you relevant ads on other
                sites.
              </p>
            </div>
          </div>
        </PolicySection>

        <PolicySection heading="4. Third-Party Cookies">
          <p className="mb-3">
            In addition to our own cookies, we may also use various third-party cookies to
            report usage statistics and deliver advertisements. These include:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Google Analytics for website analytics</li>
            <li>Social media platforms for sharing functionality</li>
            <li>Other service providers as needed</li>
          </ul>
        </PolicySection>

        <PolicySection heading="5. Managing Cookies">
          <p className="mb-3">
            You have the right to accept or reject cookies. Most web browsers automatically
            accept cookies, but you can usually modify your browser settings to decline cookies
            if you prefer. However, this may prevent you from taking full advantage of the
            website.
          </p>
          <p className="mb-3">To manage cookies, you can:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li>Adjust your browser settings to refuse cookies</li>
            <li>Delete cookies that have already been set</li>
            <li>Use browser extensions or tools to manage cookies</li>
            <li>Use our cookie consent banner (if available) to manage preferences</li>
          </ul>
        </PolicySection>

        <PolicySection heading="6. Browser-Specific Instructions">
          <p className="mb-3">To manage cookies in your browser:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-mid">
            <li><strong className="text-hi">Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li><strong className="text-hi">Firefox:</strong> Options → Privacy &amp; Security → Cookies and Site Data</li>
            <li><strong className="text-hi">Safari:</strong> Preferences → Privacy → Cookies and website data</li>
            <li><strong className="text-hi">Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
          </ul>
        </PolicySection>

        <PolicySection heading="7. Impact of Disabling Cookies">
          <p>
            If you choose to disable cookies, some features of our website may not function
            properly. You may not be able to access certain areas, save preferences, or use
            interactive features.
          </p>
        </PolicySection>

        <PolicySection heading="8. Updates to This Policy">
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our
            practices or for other operational, legal, or regulatory reasons. Please revisit
            this Cookie Policy regularly to stay informed about our use of cookies.
          </p>
        </PolicySection>

        <PolicySection heading="9. Contact Us">
          <p>
            If you have any questions about our use of cookies, please contact us at{' '}
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
