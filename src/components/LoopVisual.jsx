'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { STEPS, pickLayout } from './loop/loopLayout';

// React Flow measures the page to lay itself out, so the canvas only exists in
// the browser. It loads as its own chunk and fades in over the space kept for it.
const LoopCanvas = dynamic(() => import('./loop/LoopCanvas'), { ssr: false });

export default function LoopVisual() {
  const [active, setActive] = useState(0);
  const [layout, setLayout] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const cardRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const sizes = new ResizeObserver(([entry]) => setLayout(pickLayout(entry.contentRect.width)));
    sizes.observe(stage);
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    visibility.observe(card);
    return () => {
      sizes.disconnect();
      visibility.disconnect();
    };
  }, []);

  // The loop advances when the active step's progress bar finishes its CSS
  // animation, so pausing the animation pauses the loop with nothing else to keep
  // in sync. It pauses for the pause button, while the mouse is over the text
  // below the diagram (someone is reading), when scrolled out of view, and under
  // reduced motion (in CSS).
  const paused = !playing || hovered || !inView;
  const advance = () => setActive((current) => (current + 1) % STEPS.length);

  return (
    <div ref={cardRef} className="loop-card" data-paused={paused}>
      <div ref={stageRef} className="loop-stage">
        <div className="loop-label">Proxa Labs Loop <span>Intelligent Commercial Readiness</span></div>
        <div className="loop-canvas">
          {layout && <LoopCanvas key={layout} layout={layout} active={active} onSelect={setActive} />}
        </div>
      </div>

      <div
        className="loop-foot"
        onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <div className="loop-steps" role="group" aria-label="Steps of the Proxa Labs loop">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              type="button"
              className={i === active ? 'loop-step is-active' : 'loop-step'}
              style={{ '--c': step.color, '--ink': step.ink }}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <span className="loop-step-no">{`0${i + 1}`}</span>
              <span className="loop-step-name">{step.name}</span>
              <span className="loop-step-bar">
                {i === active && <span className="loop-step-fill" onAnimationEnd={advance} />}
              </span>
            </button>
          ))}
          <button
            type="button"
            className="loop-toggle"
            aria-label={playing ? 'Pause the loop animation' : 'Play the loop animation'}
            onClick={() => setPlaying((value) => !value)}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              {playing
                ? <path d="M1.5 1h2.4v8H1.5zM6.1 1h2.4v8H6.1z" fill="currentColor" />
                : <path d="M2 .8v8.4L9 5z" fill="currentColor" />}
            </svg>
          </button>
        </div>
        {/* All four descriptions share one grid cell: the panel keeps the height of the
            longest, so the page below never shifts as the loop advances. */}
        <div className="loop-details">
          {STEPS.map((step, i) => (
            <p
              key={step.id}
              className={i === active ? 'loop-detail is-active' : 'loop-detail'}
              style={{ '--ink': step.ink }}
              aria-hidden={i !== active}
            >
              <strong>{step.name}.</strong> {step.detail}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
