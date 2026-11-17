'use client';

import { useEffect, useRef, useState } from 'react';

import AppLogo from '../AppLogo';
import Cta from '../Cta';
import ProductGlimpse from '../media/ProductGlimpse';
import { stepIndex, swipeStep } from '../../content/productTour';

/**
 * A bright card, on a slowly drifting aurora of the brand colours, that tours the products:
 * a list of them beside one floating browser window and phone, whose real screens change
 * with the product chosen. `slides` come from content/productTour.js.
 *
 * It moves on by itself, like the loop in the hero: the chosen product's progress line is
 * a CSS animation and the next slide is shown when it ends, so pausing the animation pauses
 * the tour. It pauses only while the mouse is over the browser window or the phone (so a
 * screen can be read), while the keyboard is inside it, and off screen. Picking a product
 * shows it and the tour carries on from there. Under reduced motion it never starts (in
 * CSS).
 */
export default function ProductTour({ eyebrow, heading, cta, note, slides }) {
  const [active, setActive] = useState(0);
  // Counts the visitor's picks, so that picking a product starts its progress line again
  // even when it is the one already showing.
  const [picks, setPicks] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const panelRef = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => {
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    visibility.observe(panelRef.current);
    return () => visibility.disconnect();
  }, []);

  const paused = hovered || focused || !inView;

  // The visitor chose: show it, and carry on from it.
  const pick = (index) => {
    setActive(index);
    setPicks((n) => n + 1);
  };

  const endSwipe = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    const end = event.changedTouches[0];
    const step = start ? swipeStep(end.clientX - start.x, end.clientY - start.y) : 0;
    if (step) pick(stepIndex(active, step, slides.length));
  };

  return (
    <section className="section section-tinted product-stage-section">
      <div
        ref={panelRef}
        className="product-stage product-tour"
        role="group"
        aria-roledescription="carousel"
        aria-label="Screens of the four Proxa products"
        data-paused={paused}
        data-offscreen={!inView}
        onFocus={(event) => event.target.matches(':focus-visible') && setFocused(true)}
        onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
      >
        <div className="tour-aurora" aria-hidden="true"><i /><i /><i /><i /></div>

        <div className="product-stage-text">
          <div className="tour-head">
            {eyebrow && <div className="t-eyebrow">{eyebrow}</div>}
            {heading && <h2 className="t-h2">{heading}</h2>}
          </div>

          <div className="tour-list" role="group" aria-label="Choose a product">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={i === active ? 'tour-item is-active' : 'tour-item'}
                aria-pressed={i === active}
                onClick={() => pick(i)}
              >
                <AppLogo app={slide.id} size={34} className="tour-item-logo" />
                <span className="tour-item-text">
                  <span className="tour-item-name">{slide.name}</span>
                  <span className="tour-item-body">{slide.body}</span>
                </span>
                <span className="tour-item-bar">
                  {i === active && (
                    <span key={picks} className="tour-item-fill" onAnimationEnd={() => setActive(stepIndex(i, 1, slides.length))} />
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="tour-actions">
            <Cta cta={cta} className="bp" />
            <div className="tour-controls">
              <button type="button" className="tour-btn" aria-label="Previous product" onClick={() => pick(stepIndex(active, -1, slides.length))}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M8.5 2.5 4 7l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="tour-btn" aria-label="Next product" onClick={() => pick(stepIndex(active, 1, slides.length))}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5.5 2.5 10 7l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
          {note && <div className="product-stage-note">{note}</div>}
        </div>

        <div
          className="tour-visual"
          // The floating card's body is the browser window with the phone in front of it.
          onPointerOver={(event) => event.pointerType === 'mouse' && setHovered(Boolean(event.target.closest('.tilted-card__body')))}
          onPointerLeave={() => setHovered(false)}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={endSwipe}
        >
          <ProductGlimpse slides={slides} active={active} />
        </div>
      </div>
    </section>
  );
}
