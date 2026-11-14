'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { hrefFor, pageKeyForPath } from '../lib/routes';

const WHERE_ITEMS = [
  {icon:<Icon name="strategy" size={20} />,title:"I need an AI strategy",desc:"Assess your readiness and build a roadmap before any technology decision.",tag:"Advisory",p:"advisory"},
  {icon:<Icon name="pilot" size={20} />,title:"I want to run an AI pilot",desc:"Structure the experiment, define success criteria, build the business case.",tag:"The Lab",p:"proxalab"},
  {icon:<Icon name="literacy" size={20} />,title:"I need AI literacy training",desc:"Build AI fluency across your commercial organization before deploying tools.",tag:"AI Literacy",p:"literacy"},
  {icon:<Icon name="platform" size={20} />,title:"I'm ready for a platform",desc:"See Forge, Cue, Stage, and Trace — the only closed-loop AI platform.",tag:"AI Platform",p:"platform"},
  {icon:<Icon name="content" size={20} />,title:"I need content for a launch",desc:"AI-generated or human-led, MLR-compliant content on your timeline.",tag:"Content",p:"content"},
  {icon:<Icon name="lms" size={20} />,title:"I need an LMS first",desc:"Enterprise learning infrastructure built for biopharma compliance.",tag:"InsiteX LMS",p:"insitex"},
  {icon:<Icon name="chat" size={20} />,title:"I'm not sure yet",desc:"30 minutes. No pitch. Tell us where you're stuck.",tag:"Book a Consult",p:"contact"},
];

const Chevron = ({ open }) => (
  <svg width="11" height="7" viewBox="0 0 12 8" fill="none" style={{ marginLeft: 4, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>
    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Nav = ({ menus }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  // The fixed page this URL belongs to (null on slug routes), for the active state.
  const page = pageKeyForPath(usePathname());

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenDropdown(null); };
    const esc = (e) => { if (e.key === "Escape") setOpenDropdown(null); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", esc); };
  }, [openDropdown]);

  // Every nav link closes the menus on click; the link itself does the navigating.
  const close = () => { setOpenDropdown(null); setMobileOpen(false); setMobileAccordion(null); };

  const toggle = (k) => setOpenDropdown(o => o === k ? null : k);
  const toggleMobile = (k) => setMobileAccordion(o => o === k ? null : k);
  const isActive = (items) => items.some((it) => it.page === page);

  // Menus stay in the HTML when closed (hidden) so crawlers see every link.
  const miniMenu = (key, label) => (
    <div style={{ position: "relative" }}>
      <button
        className={"nl nl-drop" + (isActive(menus[key]) ? " on" : "")}
        onClick={() => toggle(key)}
        aria-expanded={openDropdown === key}
        style={{ color: openDropdown === key ? "var(--o)" : undefined }}
      >
        {label}
        <Chevron open={openDropdown === key} />
      </button>
      <div className="nav-mini-menu" hidden={openDropdown !== key}>
        {menus[key].map((it, i) => (
          <Link key={i} className={"nav-mini-item as-btn" + (page === it.page ? " on" : "")} href={hrefFor(it.page)} onClick={close}>{it.label}</Link>
        ))}
      </div>
    </div>
  );

  const mobileMenu = (key, label) => (
    <>
      <button className="mobile-accordion-head" onClick={() => toggleMobile(key)} aria-expanded={mobileAccordion === key}>
        <span>{label}</span>
        <span style={{ transform: mobileAccordion === key ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>▾</span>
      </button>
      <div className="mobile-accordion-body" hidden={mobileAccordion !== key}>
        {menus[key].map((it, i) => (
          <Link key={i} className={page === it.page ? "on" : ""} href={hrefFor(it.page)} onClick={close}>{it.label}</Link>
        ))}
      </div>
    </>
  );

  return (
    <>
      <nav ref={navRef} className={"nav" + (scrolled ? " up" : "")}>
        <Link className="nav-logo" href="/" onClick={close} aria-label="Proxa Labs home">
          <img className="nav-logo-img" src="/assets/proxa_horiz.png" alt="Proxa Labs" width="600" height="137" />
        </Link>
        <div className="nav-links">
          {/* Where to Start (mega) */}
          <div style={{ position: "relative" }}>
            <button
              className="nl nl-drop"
              onClick={() => toggle("where")}
              aria-expanded={openDropdown === "where"}
              style={{ color: openDropdown === "where" ? "var(--o)" : undefined }}
            >
              Where to Start
              <Chevron open={openDropdown === "where"} />
            </button>
            <div className="nav-mega-menu" hidden={openDropdown !== "where"}>
              {WHERE_ITEMS.map(d => (
                <Link key={d.title} href={hrefFor(d.p, d.track)} onClick={close} className="ndm-item as-block">
                  <div style={{ color: 'var(--o)', marginBottom: 5 }}>{d.icon}</div>
                  <div className="ndm-title">{d.title}</div>
                  <div className="ndm-desc">{d.desc}</div>
                  <span className="ndm-tag">{d.tag}</span>
                </Link>
              ))}
            </div>
          </div>

          {miniMenu("platform", "Platform")}
          {miniMenu("solutions", "Solutions")}

          <Link className={"nl as-btn" + (page === "proxalab" ? " on" : "")} href={hrefFor("proxalab")} onClick={close}>The Lab</Link>

          {miniMenu("resources", "Resources")}

          <Link className={"nl as-btn" + (page === "about" ? " on" : "")} href={hrefFor("about")} onClick={close}>About</Link>
        </div>

        <div className="nav-right">
          <Link className="no as-btn" href={hrefFor("contact")} onClick={close}>Book a Consult</Link>
          <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu" aria-expanded={mobileOpen}>
            <span style={mobileOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
            <span style={mobileOpen ? { opacity: 0 } : {}} />
            <span style={mobileOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
          </button>
        </div>
      </nav>

      <div className={"nav-mobile-menu" + (mobileOpen ? " open" : "")}>
        <button className="mobile-accordion-head" onClick={() => toggleMobile("where")} aria-expanded={mobileAccordion === "where"}>
          <span>Where to Start</span>
          <span style={{ transform: mobileAccordion === "where" ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>▾</span>
        </button>
        <div className="mobile-accordion-body" hidden={mobileAccordion !== "where"}>
          {WHERE_ITEMS.map(d => (
            <Link key={d.title} href={hrefFor(d.p, d.track)} onClick={close}>
              <span style={{ marginRight: 10 }}>{d.icon}</span>{d.title}
            </Link>
          ))}
        </div>

        {mobileMenu("platform", "Platform")}
        {mobileMenu("solutions", "Solutions")}

        <Link className={page === "proxalab" ? "on" : ""} href={hrefFor("proxalab")} onClick={close}>The Lab</Link>

        {mobileMenu("resources", "Resources")}

        <Link className={page === "about" ? "on" : ""} href={hrefFor("about")} onClick={close}>About</Link>
        <Link className="mobile-cta" href={hrefFor("contact")} onClick={close}>Book a Consult</Link>
      </div>
    </>
  );
};

export default Nav;
