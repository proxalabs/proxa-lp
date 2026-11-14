'use client';

import { useEffect, useRef, useState } from 'react';

import AppLogo from '../AppLogo';
import { APP_LOGOS } from '../appLogos';
import Cta from '../Cta';
import ProductGlimpse from '../media/ProductGlimpse';
import { stepIndex, swipeStep } from '../../content/productTour';

/**
 * A dark panel that tours the products: a list of them beside one floating browser window
 * and phone, whose real screens change with the product chosen. `slides` come from
 * content/productTour.js.
 *
 * It moves on by itself, like the loop in the hero: the chosen product's progress line is
 * a CSS animation and the next slide is shown when it ends, so pausing the animation pauses
 * the tour. It pauses under the mouse, while the keyboard is inside it, off screen and for
 * the pause button, and it stops once the visitor picks a product themselves. Under
 * reduced motion it never starts (in CSS).
 */
export default function ProductTour({ eyebrow, heading, cta, note, slides }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
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

  const paused = !playing || hovered || focused || !inView;

  // The visitor chose: show it and leave it there.
  const pick = (index) => {
    setActive(index);
    setPlaying(false);
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
        onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={(event) => event.target.matches(':focus-visible') && setFocused(true)}
        onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
      >
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
                style={{ '--c': APP_LOGOS[slide.id].color }}
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
                    <span className="tour-item-fill" onAnimationEnd={() => setActive(stepIndex(i, 1, slides.length))} />
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
              <button
                type="button"
                className="tour-btn tour-toggle"
                aria-label={playing ? 'Pause the product tour' : 'Play the product tour'}
                onClick={() => {
                  setPlaying((value) => !value);
                  setFocused(false);
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  {playing
                    ? <path d="M1.5 1h2.4v8H1.5zM6.1 1h2.4v8H6.1z" fill="currentColor" />
                    : <path d="M2 .8v8.4L9 5z" fill="currentColor" />}
                </svg>
              </button>
            </div>
          </div>
          {note && <div className="product-stage-note">{note}</div>}
        </div>

        <div
          className="tour-visual"
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
