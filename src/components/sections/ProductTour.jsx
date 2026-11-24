'use client';

import { useEffect, useRef, useState } from 'react';

import Photo from '../media/Photo';
import { stepIndex, swipeStep } from '../../content/productTour';

// How long a product stays in front before the next one takes its place.
const STEP_MS = 6000;

const Triangle = () => (
  <svg width="13" height="14" viewBox="0 0 13 14" aria-hidden="true">
    <path d="M2 1.2v11.6L12 7z" fill="currentColor" />
  </svg>
);

/**
 * The home page's product tour: a band the full width of the screen, in the colour of the
 * product on show, with that product's real screen in front and the other products' screens
 * stacked behind it, each a step further back. `slides` come from content/productTour.js.
 *
 * It moves on by itself: every few seconds the screen just behind comes to the front and
 * the one in front goes to the back of the stack. It waits only while the mouse is over the
 * front screen (so that it can be read), while the keyboard is inside the tour, and off
 * screen. An arrow, a swipe or a click on a screen behind chooses a product, and the tour
 * carries on from there. Under reduced motion it never moves by itself.
 */
export default function ProductTour({ eyebrow, heading, slides }) {
  // `previous` is the product that was in front before this one, which tells each screen
  // how far it has just moved; `turn` counts the changes, so the wait starts again each time.
  const [deck, setDeck] = useState({ active: 0, previous: 0, turn: 0 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const sectionRef = useRef(null);
  const touchStart = useRef(null);
  const count = slides.length;

  useEffect(() => {
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    visibility.observe(sectionRef.current);
    return () => visibility.disconnect();
  }, []);

  const show = (pick) => setDeck((d) => ({ active: pick(d.active), previous: d.active, turn: d.turn + 1 }));
  const step = (delta) => show((current) => stepIndex(current, delta, count));

  const paused = hovered || focused || !inView;
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setTimeout(() => setDeck((d) => ({ active: stepIndex(d.active, 1, count), previous: d.active, turn: d.turn + 1 })), STEP_MS);
    return () => clearTimeout(timer);
  }, [deck.turn, paused, count]);

  const endSwipe = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    const end = event.changedTouches[0];
    const delta = start ? swipeStep(end.clientX - start.x, end.clientY - start.y) : 0;
    if (delta) step(delta);
  };

  // A screen's place in the stack: 0 is the front, then one step back for each product after it.
  const placeOf = (index, front) => stepIndex(index, -front, count);

  return (
    <section
      ref={sectionRef}
      className="product-deck"
      role="group"
      aria-roledescription="carousel"
      aria-label="Screens of the four Proxa products"
      onFocus={(event) => event.target.matches(':focus-visible') && setFocused(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
    >
      <div className="product-deck-colour" aria-hidden="true">
        {slides.map((slide, i) => <i key={slide.id} data-product={slide.id} className={i === deck.active ? 'is-on' : undefined} />)}
      </div>

      <div className="product-deck-head">
        {eyebrow && <p className="product-deck-eyebrow">{eyebrow}</p>}
        {heading && <h2 className="product-deck-heading">{heading}</h2>}
      </div>

      <div className="product-deck-stage">
        <button type="button" className="deck-arrow deck-arrow-back" aria-label="Previous product" onClick={() => step(-1)}><Triangle /></button>
        <div
          className="deck"
          onPointerOver={(event) => event.pointerType === 'mouse' && setHovered(Boolean(event.target.closest('[data-place="0"]')))}
          onPointerLeave={() => setHovered(false)}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={endSwipe}
        >
          {slides.map((slide, i) => {
            const place = placeOf(i, deck.active);
            // A screen that moved more than one place (front to back, or the reverse) fades
            // out and back in on the way, so it is never seen passing through the others.
            // The two names are the same animation; alternating them restarts it.
            const jumped = deck.turn > 0 && Math.abs(place - placeOf(i, deck.previous)) > 1;
            return (
              <div
                key={slide.id}
                className="deck-screen"
                data-place={place}
                aria-hidden={place !== 0}
                style={jumped ? { animationName: deck.turn % 2 ? 'deck-swap-a' : 'deck-swap-b' } : undefined}
                onClick={place === 0 ? undefined : () => show(() => i)}
              >
                <Photo name={slide.desktop} sizes="(max-width: 900px) 92vw, 1000px" />
              </div>
            );
          })}
        </div>
        <button type="button" className="deck-arrow deck-arrow-next" aria-label="Next product" onClick={() => step(1)}><Triangle /></button>
      </div>
    </section>
  );
}
