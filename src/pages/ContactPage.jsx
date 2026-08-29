import { useState } from 'react'
import { Mail, Clock, Shield } from 'lucide-react'
import SEO from '../components/SEO'
import PolicyLayout, { PolicySection } from '../components/PolicyLayout'

function ContactCard({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-edge bg-panel p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-volt" />
      <div>
        <p className="text-xs text-mid">{label}</p>
        {href ? (
          <a href={href} className="text-sm font-semibold text-hi transition-colors hover:text-volt">
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
        title="Contact Videsaur"
        description="Get in touch with the Videsaur team. General enquiries, copyright requests, or partnership questions — we respond within 2–3 business days."
        canonicalPath="/contact"
      />
      <PolicyLayout title="Contact Us" breadcrumb="Contact">
        <PolicySection heading="Get in Touch">
          <div className="grid gap-3 sm:grid-cols-3">
            <ContactCard
              icon={Mail}
              label="General enquiries"
              value="hello@videsaur.co.in"
              href="mailto:hello@videsaur.co.in"
            />
            <ContactCard
              icon={Shield}
              label="Copyright / DMCA"
              value="dmca@videsaur.co.in"
              href="mailto:dmca@videsaur.co.in"
            />
            <ContactCard
              icon={Clock}
              label="Response time"
              value="2–3 business days (DMCA: 24–48 h)"
            />
          </div>
        </PolicySection>

        <PolicySection heading="Send a Message">
          {sent ? (
            <div className="rounded-2xl border border-volt/30 bg-volt/10 p-6 text-center">
              <p className="text-sm font-semibold text-hi">Message received!</p>
              <p className="mt-1 text-xs text-mid">We&rsquo;ll reply to your email within 2–3 business days.</p>
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
                    className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-volt"
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
                    className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-volt"
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
                  className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-volt"
                  placeholder="General enquiry / Partnership / Other"
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
                  className="w-full resize-none rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-volt"
                  placeholder="Tell us how we can help..."
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-volt px-6 py-2.5 text-sm font-semibold text-hi transition-colors hover:bg-volt-hi"
              >
                Send message
              </button>
            </form>
          )}
        </PolicySection>

        <PolicySection heading="For Copyright & DMCA Notices">
          <p>
            For copyright takedown requests, please email{' '}
            <a href="mailto:dmca@videsaur.co.in" className="text-hi hover:text-volt">
              dmca@videsaur.co.in
            </a>{' '}
            directly rather than using the form above. Include all required DMCA information —
            see our{' '}
            <a href="/content-policy" className="text-hi underline underline-offset-2 hover:text-volt">
              Content &amp; DMCA Policy
            </a>{' '}
            for exactly what to include. We process copyright notices within 24–48 hours.
          </p>
        </PolicySection>
      </PolicyLayout>
    </>
  )
}
