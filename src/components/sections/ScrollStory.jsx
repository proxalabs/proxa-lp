'use client';

import { useEffect, useRef, useState } from 'react';
import LineMotion from '../media/LineMotion';

const Arrow = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * A dark, full-width section that presents a few topics one after another. On a wide screen
 * their titles stay fixed on the left while the topics rise past on the right, one at a
 * time from the bottom of the screen to the top, each an animation with its explanation
 * under it; the title of the topic on screen is lit. On a narrow screen the topics are
 * simply stacked, each under its own title.
 *
 * `steps` are `{ id, title, heading, text }`, where `id` names a LineMotion scene.
 */
export default function ScrollStory({ label, steps }) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean);
    let frame = 0;
    // A step takes over once its animation has risen fully onto the screen, which is when
    // its top is about 340px above the bottom edge. So the lit title is the last step to
    // have got that far: the first while the section is still arriving, the last once
    // they have all gone by.
    const update = () => {
      frame = 0;
      const line = Math.max(window.innerHeight * 0.4, window.innerHeight - 340);
      let index = 0;
      els.forEach((el, i) => { if (el.getBoundingClientRect().top <= line) index = i; });
      setActive(index);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    // Only watch the scrolling while the section is on screen.
    const listen = (on) => {
      const change = on ? window.addEventListener : window.removeEventListener;
      change('scroll', onScroll, { passive: true });
      change('resize', onScroll);
    };
    const watcher = new IntersectionObserver(([entry]) => {
      listen(entry.isIntersecting);
      if (entry.isIntersecting) update();
    });
    watcher.observe(sectionRef.current);
    return () => {
      watcher.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="scroll-story" ref={sectionRef}>
      <div className="scroll-story-inner">
        <div className="scroll-story-rail">
          <h2 className="scroll-story-label">{label}</h2>
          <ol className="scroll-story-titles">
            {steps.map((step, i) => (
              <li key={step.id}>
                <a href={`#story-${step.id}`} className={'scroll-story-title' + (i === active ? ' on' : '')} aria-current={i === active ? 'step' : undefined}>
                  <span className="scroll-story-arrow"><Arrow /></span>
                  {step.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        <div className="scroll-story-steps">
          {steps.map((step, i) => (
            <article key={step.id} id={`story-${step.id}`} className="scroll-story-step" data-index={i} ref={(el) => { stepRefs.current[i] = el; }}>
              <p className="scroll-story-step-name"><span>{String(i + 1).padStart(2, '0')}</span>{step.title}</p>
              <LineMotion scene={step.id} />
              <h3 className="scroll-story-heading">{step.heading}</h3>
              <p className="scroll-story-text">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
