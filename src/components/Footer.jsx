import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Videsaur site footer">
      <div className="site-footer__grid">
        <section aria-labelledby="footer-platform-heading">
          <h2 id="footer-platform-heading" className="site-footer__heading site-footer__brand-heading">
            Videsaur
          </h2>
          <p className="site-footer__overview">
            Videsaur is an open-access digital curation workshop providing high-performance
            media elements, short-form reaction transitions, and lossless soundboards for
            digital media professionals and social media creators.
          </p>
        </section>

        <nav aria-labelledby="footer-assets-heading">
          <h2 id="footer-assets-heading" className="site-footer__heading">Asset Libraries</h2>
          <ul className="site-footer__links">
            <li><a className="site-footer__link" href="/trending-memes">Trending Memes</a></li>
            <li><a className="site-footer__link" href="/gifs">Animated GIFs</a></li>
            <li><a className="site-footer__link" href="/sound-effects">Sound Effects</a></li>
            <li><a className="site-footer__link" href="/meme-templates">Meme Templates</a></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-legal-heading">
          <h2 id="footer-legal-heading" className="site-footer__heading">Privacy &amp; Legal</h2>
          <ul className="site-footer__links">
            <li><a className="site-footer__link" href="/privacy-policy">Privacy Policy</a></li>
            <li><a className="site-footer__link" href="/terms-and-conditions">Terms of Use</a></li>
            <li><a className="site-footer__link" href="/dmca-policy">DMCA Policy</a></li>
            <li><a className="site-footer__link" href="/cookie-policy">Cookie Policy</a></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-company-heading">
          <h2 id="footer-company-heading" className="site-footer__heading">Company</h2>
          <ul className="site-footer__links">
            <li><a className="site-footer__link" href="/about-us">About Us</a></li>
            <li><a className="site-footer__link" href="/contact-us">Contact Us</a></li>
            <li><a className="site-footer__link" href="/disclaimer">Platform Disclaimer</a></li>
          </ul>
        </nav>
      </div>

      <div className="site-footer__statutory">
        <p>© 2026 Videsaur. All rights reserved. Materials curated under Fair Use.</p>
      </div>
    </footer>
  )
}
