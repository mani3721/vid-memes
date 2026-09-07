import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Clock, HelpCircle } from 'lucide-react'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

function ContactCard({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-edge bg-panel p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-brand" />
      <div>
        <p className="text-xs text-mid">{label}</p>
        {href ? (
          <a href={href} className="text-sm font-semibold text-hi transition-colors hover:text-brand">
            {value}
          </a>
        ) : (
          <p className="text-sm font-semibold text-hi">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  function handleSubmit(e) {
    e.preventDefault()
    // Stub: in production, POST to a form endpoint (Formspree, Netlify Forms, etc.)
    setSent(true)
  }

  return (
    <>
      <SEO
        title="Contact Videsaur.co.in"
        description="Get in touch with the Videsaur.co.in team. General enquiries, support, feedback, or copyright requests — we respond within 24–48 hours."
        canonicalPath="/contact"
      />
      <PolicyLayout title="Contact Us" breadcrumb="Contact">
        <PolicySection heading="Get in Touch">
          <p>
            We&rsquo;d love to hear from you! Whether you have a question, feedback, suggestion,
            or need support, our team is here to help. Please use the contact information below
            to reach out to us.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ContactCard
              icon={Mail}
              label="Email Us"
              value="support@videsaur.co.in"
              href="mailto:support@videsaur.co.in"
            />
            <ContactCard
              icon={Clock}
              label="Response Time"
              value="24–48 hours (business days)"
            />
            <ContactCard
              icon={HelpCircle}
              label="Support"
              value="Technical, content &amp; general"
            />
          </div>
        </PolicySection>

        <PolicySection heading="Send a Message">
          {sent ? (
            <div className="rounded-2xl border border-brand/30 bg-brand/10 p-6 text-center">
              <p className="text-sm font-semibold text-hi">Message received!</p>
              <p className="mt-1 text-xs text-mid">We&rsquo;ll reply to your email within 24–48 hours on business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold text-hi">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-brand"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold text-hi">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-brand"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="mb-1 block text-xs font-semibold text-hi">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-brand"
                  placeholder="Technical support / Feedback / Partnership / Other"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold text-hi">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-brand"
                  placeholder="Tell us how we can help..."
                />
              </div>
              <button
                type="submit"
                className="btn-primary rounded-full px-6 py-2.5 text-sm font-semibold"
              >
                Send message
              </button>
            </form>
          )}
        </PolicySection>

        <PolicySection heading="What We Can Help With">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Technical support and troubleshooting</li>
            <li>Content-related questions</li>
            <li>Account and profile assistance</li>
            <li>Feedback and suggestions</li>
            <li>Copyright and DMCA inquiries</li>
            <li>Partnership and collaboration opportunities</li>
            <li>General questions about our platform</li>
          </ul>
        </PolicySection>

        <PolicySection heading="Before Contacting Us">
          <p>
            Before reaching out, you might find answers to common questions in our:
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <Link to="/privacy-policy" className="text-hi underline underline-offset-2 hover:text-brand">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-hi underline underline-offset-2 hover:text-brand">
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </PolicySection>

        <PolicySection heading="Follow Us">
          <p>
            Stay connected with us for the latest updates, new content, and announcements.
            Follow us on our social media platforms to be part of our growing community!
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
