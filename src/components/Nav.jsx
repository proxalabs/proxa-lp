'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hrefFor, pageKeyForPath } from '../lib/routes';

const Chevron = ({ open }) => (
  <svg width="11" height="7" viewBox="0 0 12 8" fill="none" style={{ marginLeft: 4, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>
    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// The two shapes of the bar inside the menu button; styles.css animates between them.
const TOGGLE_BAR_CLOSED = { x: 8.5, y: 5, width: 1.75, height: 14, rx: 0 };
const TOGGLE_BAR_OPEN = { x: 5.75, y: 8, width: 3.75, height: 8, rx: 1.4 };

// The phone menu's open/close mark; styles.css turns it over and tints it when its section is open.
const AccordionChevron = () => (
  <span className="mobile-accordion-chevron" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
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
        <AccordionChevron />
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
          {miniMenu("platform", "Platform")}
          {miniMenu("solutions", "Solutions")}

          <Link className={"nl as-btn" + (page === "proxalab" ? " on" : "")} href={hrefFor("proxalab")} onClick={close}>The Lab</Link>

          {miniMenu("resources", "Resources")}

          <Link className={"nl as-btn" + (page === "about" ? " on" : "")} href={hrefFor("about")} onClick={close}>About</Link>
        </div>

        <div className="nav-right">
          <Link className="no as-btn" href={hrefFor("contact")} onClick={close}>Book a Consult</Link>
          <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu" aria-expanded={mobileOpen}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2.75" y="5" width="18.5" height="14" rx="3.5" stroke="currentColor" strokeWidth="1.75" />
              {/* The panel's edge: a thin line while the menu is closed, a filled bar while it is open. */}
              <rect className="nav-toggle-bar" fill="currentColor" {...(mobileOpen ? TOGGLE_BAR_OPEN : TOGGLE_BAR_CLOSED)} />
            </svg>
          </button>
        </div>
      </nav>

      <div className={"nav-mobile-menu" + (mobileOpen ? " open" : "")}>
        {mobileMenu("platform", "Platform")}
        {mobileMenu("solutions", "Solutions")}

        <Link className={page === "proxalab" ? "on" : ""} href={hrefFor("proxalab")} onClick={close}>The Lab</Link>

        {mobileMenu("resources", "Resources")}

        <Link className={page === "about" ? "on" : ""} href={hrefFor("about")} onClick={close}>About</Link>
      </div>
    </>
  );
};

export default Nav;
