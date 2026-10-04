import { ExternalLink, Heart, Server, ShieldCheck } from 'lucide-react'
import SEO from '../components/SEO'

const PAYMENT_LINK = 'https://payments.cashfree.com/links?code=hb40q6neqndg_AAAAAAAOfI'
const UPI_ID = 'pmanikandan3721@oksbi'
const UPI_LINK = `upi://pay?pa=${UPI_ID}&pn=Videsaur&cu=INR`

export default function SupportUsPage() {
  return (
    <>
      <SEO
        title="Support Videsaur — Help Keep Us Online"
        description="Help Videsaur cover its server and storage costs. Contributions are completely optional, and Videsaur remains free for everyone."
        canonicalPath="/support-us"
        noindex
      />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="overflow-hidden rounded-3xl border border-edge bg-panel">
          <header className="border-b border-edge bg-gradient-to-br from-brand/15 via-panel to-panel px-5 py-8 text-center sm:px-10 sm:py-12">
            <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-brand text-char shadow-lg shadow-brand/20">
              <Heart className="size-7" aria-hidden fill="currentColor" />
            </span>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Support Videsaur
            </p>
            <h1 className="font-display text-3xl tracking-wide text-hi sm:text-4xl">
              A SMALL REQUEST: HELP US KEEP VIDESAUR ONLINE
            </h1>
          </header>

          <div className="space-y-8 px-5 py-7 text-sm leading-7 text-mid sm:px-10 sm:py-10 sm:text-base">
            <section className="space-y-4" aria-labelledby="request-heading">
              <h2 id="request-heading" className="sr-only">Our request</h2>
              <p>Hey everyone,</p>
              <p>
                Running Videsaur costs real money each month, mainly for server and storage
                hosting. This month we need about <strong className="text-hi">₹4,000</strong> to
                cover the renewal, and we&rsquo;re short on it. We didn&rsquo;t want to put ads on
                the site or paywall features to cover it.
              </p>
              <p>
                If you&rsquo;ve enjoyed using Videsaur and can spare even ₹1, it would genuinely
                help keep the site running for everyone. No pressure at all &mdash; this is
                completely optional, and the site stays free either way.
              </p>
            </section>

            <section className="rounded-2xl border border-brand/30 bg-brand/10 p-5 sm:p-6" aria-labelledby="payment-heading">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
                  <Server className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 id="payment-heading" className="font-semibold text-hi">Help with this month&rsquo;s hosting</h2>
                  <p className="text-xs text-mid">Any amount makes a difference.</p>
                </div>
              </div>

              <div className="rounded-xl border border-edge bg-panel p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-lo">UPI ID</p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-hi">{UPI_ID}</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a
                  href={UPI_LINK}
                  className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Pay with UPI
                  <ExternalLink className="size-4" aria-hidden />
                </a>
                <a
                  href={PAYMENT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-edge bg-panel px-5 py-3 text-sm font-semibold text-hi transition-colors hover:border-brand hover:text-brand"
                >
                  Open secure pay link
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </div>

              <p className="mt-4 flex items-start gap-2 text-xs text-mid">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                Payments are processed by your UPI app or Cashfree. Videsaur does not store your payment details.
              </p>
            </section>

            <section className="space-y-4 border-t border-edge pt-7" aria-labelledby="thanks-heading">
              <h2 id="thanks-heading" className="font-display text-xl tracking-wide text-hi">THANK YOU</h2>
              <p>
                Thank you for being part of this community. We built this for you, and your
                support means a lot.
              </p>
              <p className="font-semibold text-hi">&mdash; The Videsaur team</p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
