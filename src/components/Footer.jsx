import Link from 'next/link';
import { hrefFor } from '../lib/routes';

const FOOTER_COLUMNS = [
  ["Platform", [
    ["AI Platform", "platform"],
    ["InsiteX LMS", "insitex"],
  ]],
  ["Solutions", [
    ["AI Literacy", "literacy"],
    ["Advisory", "advisory"],
    ["Content", "content"],
  ]],
  ["The Lab", [
    ["Overview", "proxalab"],
  ]],
  ["Resources", [
    ["Blog", "blog"],
    ["News", "newsHub"],
  ]],
  ["About", [
    ["About Proxa Labs", "about"],
  ]],
];

const CREDENTIALS = [
  { full: "SOC 2 Type II in progress", short: "SOC 2 in progress" },
];

const Footer = () => (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="footer-logo-wrap as-block" href="/" aria-label="Proxa Labs home">
              <img className="footer-logo-img" src="/assets/proxa_horiz.png" alt="Proxa Labs" width="600" height="137" loading="lazy" />
            </Link>
            <p className="footer-tagline">The AI-native platform and implementation partner built for the organizational complexity of biopharma commercial learning — not adapted for it.</p>
            <Link className="footer-cta as-btn" href={hrefFor("contact")}>Book a Consult</Link>
          </div>
          {FOOTER_COLUMNS.map(([h, links]) => (
            <div key={h} className="footer-col">
              <div className="footer-col-head">{h}</div>
              {links.map(([l, p, hash], i) => (
                p
                  ? <Link key={l} className="footer-col-link as-block" href={hrefFor(p, hash)}>{l}</Link>
                  : <div key={i} className="footer-col-link footer-col-link-disabled">{l}</div>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-divider" />

        <div className="footer-mid">
          <div className="footer-hq">
            <div className="footer-col-head">Headquarters</div>
            <div className="footer-hq-name">Newark, Delaware</div>
            <div className="footer-hq-addr">Proxa Labs LLC · 591 Collaboration Way, Suite 613</div>
          </div>
          <div className="footer-credentials">
            <div className="footer-col-head" style={{ textAlign: "right" }}>Credentials</div>
            <div className="footer-credentials-row">
              {CREDENTIALS.map(t => (
                <span key={t.full} className="footer-credential-pill">
                  <span className="footer-credential-full">{t.full}</span>
                  <span className="footer-credential-short">{t.short}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="footer-copyright">© 2026 Proxa Labs LLC · Proxa Labs LLC is a Delaware limited liability company</div>
          <div className="footer-legal">
            {/* These pages do not exist yet, so the links carry no href: a crawler
                must not follow them to a 404. */}
            <a role="link" aria-disabled="true">Privacy Policy</a>
            <a role="link" aria-disabled="true">Terms</a>
          </div>
        </div>
      </div>
    </footer>
);

export default Footer;
