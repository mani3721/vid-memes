import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const initialForm = { name: '', email: '', inquiryType: '', message: '' }

export default function ContactPage() {
  const [form, setForm] = useState(initialForm)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const subject = encodeURIComponent(`[${form.inquiryType}] Contact request from ${form.name}`)
    const body = encodeURIComponent(
      `Full Name: ${form.name}\nEmail Address: ${form.email}\nInquiry Type: ${form.inquiryType}\n\n${form.message}`,
    )

    window.location.href = `mailto:support@videsaur.co.in?subject=${subject}&body=${body}`
  }

  return (
    <>
      <SEO
        title="Contact Us — Videsaur"
        description="Contact the Videsaur administrative team for technical support, media curation suggestions, general feedback, or copyright and DMCA inquiries."
        canonicalPath="/contact-us"
      />

      <main className="contact-page">
        <header className="contact-header">
          <h1>Contact Us</h1>
          <p>
            Connect with the Videsaur coordination desk for platform support, curation feedback,
            and compliance assistance.
          </p>
        </header>

        <div className="contact-grid">
          <section className="contact-panel" aria-labelledby="inquiry-form-title">
            <h2 id="inquiry-form-title">Send an Inquiry</h2>
            <p className="contact-intro">
              Complete the form below and your email application will prepare a message for our
              administrative team.
            </p>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-field">
                <label htmlFor="contact-name">Full Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={updateField}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={updateField}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-inquiry-type">Inquiry Type</label>
                <select
                  id="contact-inquiry-type"
                  name="inquiryType"
                  required
                  value={form.inquiryType}
                  onChange={updateField}
                >
                  <option value="" disabled>Select an inquiry category</option>
                  <option value="General Feedback">General Feedback</option>
                  <option value="Technical Support / Build Glitch">
                    Technical Support / Build Glitch
                  </option>
                  <option value="Media Curation Suggestions">Media Curation Suggestions</option>
                  <option value="Copyright / DMCA Inquiries">Copyright / DMCA Inquiries</option>
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="7"
                  required
                  minLength="10"
                  value={form.message}
                  onChange={updateField}
                />
              </div>

              <button type="submit" className="contact-submit">
                Submit Inquiry
              </button>
            </form>
          </section>

          <aside className="contact-panel contact-trust" aria-labelledby="contact-info-title">
            <h2 id="contact-info-title">Administrative Contact Info</h2>

            <div className="contact-info-block">
              <h3>Direct Support Endpoint</h3>
              <a href="mailto:support@videsaur.co.in">support@videsaur.co.in</a>
            </div>

            <div className="contact-info-block">
              <h3>Standard Response Window</h3>
              <p>
                Our coordination desk reviews and processes standard technical and curation
                inquiries within a strict 24-to-48 hour window.
              </p>
            </div>

            <div className="contact-legal-note" role="note" aria-label="Urgent legal inquiries">
              <h3>Intellectual Property Notices</h3>
              <p>
                For urgent intellectual property claims, trademark issues, or removal requests,
                please submit a formal notification directly via our automated{' '}
                <Link to="/dmca-policy">DMCA Policy lane</Link> for immediate safe-harbor
                remediation.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        .contact-page {
          max-width: 1120px;
          margin: 0 auto;
          padding: 48px 20px 64px;
          color: var(--text-primary);
          font-size: 16px;
          line-height: 1.7;
        }

        .contact-header {
          max-width: 720px;
          margin: 0 auto 36px;
          text-align: center;
        }

        .contact-header h1 {
          margin: 0 0 12px;
          color: var(--text-primary);
          font-size: clamp(2rem, 5vw, 2.75rem);
          line-height: 1.2;
        }

        .contact-header p,
        .contact-intro,
        .contact-info-block p,
        .contact-legal-note p {
          color: var(--text-secondary);
        }

        .contact-header p,
        .contact-intro,
        .contact-info-block p,
        .contact-legal-note p,
        .contact-info-block h3,
        .contact-legal-note h3 {
          margin-top: 0;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 28px;
          align-items: start;
        }

        .contact-panel {
          padding: 28px;
          border: 1px solid var(--border-edge);
          border-radius: 16px;
          background: var(--bg-panel);
        }

        .contact-panel h2 {
          margin: 0 0 10px;
          color: var(--text-primary);
          font-size: 1.4rem;
          line-height: 1.4;
        }

        .contact-form {
          display: grid;
          gap: 20px;
          margin-top: 24px;
        }

        .contact-field {
          display: grid;
          gap: 8px;
        }

        .contact-field label,
        .contact-info-block h3,
        .contact-legal-note h3 {
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 700;
          line-height: 1.6;
        }

        .contact-field input,
        .contact-field select,
        .contact-field textarea {
          width: 100%;
          min-height: 48px;
          box-sizing: border-box;
          border: 1px solid var(--border-edge);
          border-radius: 8px;
          background: var(--bg-panel);
          color: var(--text-primary);
          font: inherit;
          line-height: 1.6;
          padding: 11px 12px;
        }

        .contact-field textarea {
          min-height: 168px;
          resize: vertical;
        }

        .contact-field input:focus,
        .contact-field select:focus,
        .contact-field textarea:focus,
        .contact-submit:focus-visible,
        .contact-trust a:focus-visible {
          outline: 2px solid var(--text-primary);
          outline-offset: 3px;
        }

        .contact-submit {
          min-width: 48px;
          min-height: 48px;
          justify-self: start;
          border: 1px solid var(--text-primary);
          border-radius: 8px;
          background: var(--text-primary);
          color: var(--bg-panel);
          cursor: pointer;
          font: inherit;
          font-weight: 700;
          padding: 12px 24px;
        }

        .contact-submit:hover {
          background: var(--text-secondary);
          border-color: var(--text-secondary);
        }

        .contact-trust {
          display: grid;
          gap: 24px;
        }

        .contact-info-block {
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-edge);
        }

        .contact-info-block h3,
        .contact-legal-note h3 {
          margin-bottom: 8px;
        }

        .contact-trust a {
          display: inline-flex;
          align-items: center;
          min-height: 48px;
          color: var(--text-primary);
          font-weight: 700;
          overflow-wrap: anywhere;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .contact-legal-note {
          padding: 20px;
          border: 1px solid var(--border-edge);
          border-left-width: 4px;
          border-radius: 8px;
          background: var(--bg-panel);
        }

        .contact-legal-note p {
          margin-bottom: 0;
        }

        @media (max-width: 760px) {
          .contact-page {
            padding: 36px 16px 48px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }

          .contact-panel {
            padding: 22px 18px;
          }

          .contact-submit {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
