'use client';

import { useEffect, useRef } from 'react';
import { CHART, CLOUD, LOOP, NET, SCENES, VIEW, toKeyframes } from './lineScenes';

// A part's colour, as the class that strokes it or fills it.
const STROKE = { ink: 'lm-k', orange: 'lm-o', blue: 'lm-b' };
const FILL = { ink: 'lm-fk', orange: 'lm-fo', blue: 'lm-fb' };

// Each scene is drawn as its finished picture; lineScenes.js moves the parts named `data-lm`.
// Anything that draws itself or carries a moving dash is a <path> with pathLength="1", which
// every browser measures the same way.

// Three sources under a cloud, a dotted feed up from each, and the cloud's ten places filled.
const Cloud = () => (
  <>
    <path data-lm="cloud-halo" className="lm-s lm-o lm-pop" d={CLOUD.outline} opacity={0} />
    {CLOUD.feeds.map((f) => (
      <line key={f.j} data-lm={`feed-${f.j}`} className="lm-s lm-k2 lm-dotted" x1={f.x} y1={f.y1} x2={f.x} y2={f.y2} />
    ))}
    {CLOUD.slots.map((s) => (
      <circle key={s.n} data-lm={`packet-${s.n}`} className={FILL[s.tone]} cx={s.from.x} cy={s.from.y} r={2.2} opacity={0} />
    ))}
    {/* Filled with the background, so a packet disappears as it passes under the base. */}
    <path data-lm="cloud" className="lm-s lm-k lm-fbg lm-draw" pathLength="1" d={CLOUD.outline} />
    {CLOUD.slots.map((s) => (
      <g key={s.n}>
        <circle data-lm={`slot-${s.n}`} className="lm-fk" cx={s.x} cy={s.y} r={1.6} fillOpacity={0.18} />
        <circle data-lm={`fill-${s.n}`} className={`${FILL[s.tone]} lm-pop`} cx={s.x} cy={s.y} r={2.6} />
      </g>
    ))}
    {/* A document, a person and a table. */}
    <g data-lm="source-0" opacity={0.7}>
      <rect className="lm-s lm-k" x={154} y={217} width={22} height={30} rx={3} />
      <path className="lm-s lm-k2" d="M159 226H171M159 232H171M159 238H167" />
    </g>
    <g data-lm="source-1" opacity={0.7}>
      <circle className="lm-s lm-k" cx={225} cy={223} r={5.5} />
      <path className="lm-s lm-k" d="M213 247a12 12 0 0 1 24 0" />
    </g>
    <g data-lm="source-2" opacity={0.7}>
      <rect className="lm-s lm-k" x={273} y={218} width={24} height={28} rx={3} />
      <path className="lm-s lm-k2" d="M273 227H297M285 227V246M273 236.5H297" />
    </g>
  </>
);

// A four-point spark, centred on the network's output.
const { x: OX, y: OY, r: OR } = NET.output;
const SPARK = `M${OX} ${OY - 9}Q${OX} ${OY} ${OX + 9} ${OY}Q${OX} ${OY} ${OX} ${OY + 9}Q${OX} ${OY} ${OX - 9} ${OY}Q${OX} ${OY} ${OX} ${OY - 9}Z`;

// A small neural network whose output ring has turned orange around a filled spark.
const Ai = () => (
  <>
    {[0, 1, 2].map((hop) => (
      <g key={hop} data-lm={`links-${hop}`}>
        {NET.links.filter((l) => l.hop === hop).map((l) => (
          <line key={l.id} className="lm-s lm-k3" x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y} />
        ))}
      </g>
    ))}
    {NET.signals.map((s) => (
      <path key={s.id} data-lm={`signal-${s.id}`} className={`lm-s lm-signal ${STROKE[s.tone]}`} pathLength="1" d={`M${s.from.x} ${s.from.y}L${s.to.x} ${s.to.y}`} opacity={0} />
    ))}
    {/* Nodes are filled with the background, so links and signals stop at their edges. */}
    {NET.nodes.map((n) => (
      <circle key={n.id} data-lm={`node-${n.id}`} className="lm-s lm-k lm-fbg lm-pop" cx={n.x} cy={n.y} r={4.5} />
    ))}
    {NET.glows.map((g) => (
      <circle key={g.id} data-lm={`glow-${g.id}`} className={FILL[g.tone]} cx={g.x} cy={g.y} r={2.6} opacity={0} />
    ))}
    <circle data-lm="out-halo" className="lm-s lm-o lm-pop" cx={OX} cy={OY} r={OR} opacity={0} />
    <circle data-lm="out-ring" className="lm-s lm-k lm-fbg lm-pop" cx={OX} cy={OY} r={OR} />
    <circle data-lm="out-blue" className="lm-s lm-b" cx={OX} cy={OY} r={OR} opacity={0} />
    <circle data-lm="out-orange" className="lm-s lm-o" cx={OX} cy={OY} r={OR} />
    <g data-lm="spark" className="lm-pop">
      <path className="lm-s lm-k" d={SPARK} />
      <path data-lm="spark-fill" className="lm-s lm-o lm-fo" d={SPARK} />
    </g>
    <path data-lm="plus" className="lm-s lm-o lm-pop" d={`M${OX + 23} ${OY - 29}v10M${OX + 18} ${OY - 24}h10`} />
  </>
);

// A bar chart measured against a dashed target, with a trend line over it and a note on
// its last point.
const Analysis = () => {
  const { plot, chip, trend } = CHART;
  const last = trend[trend.length - 1];
  return (
    <>
      {CHART.grid.map((y, n) => (
        <line key={y} data-lm={`grid-${n}`} className="lm-s lm-k3" x1={plot.left} y1={y} x2={plot.right} y2={y} />
      ))}
      {CHART.bars.map((bar) => (
        <g key={bar.i} data-lm={`bar-${bar.i}`} className="lm-grow">
          <path className="lm-s lm-k lm-bar" d={bar.d} />
          {bar.over && <path data-lm={`over-${bar.i}`} className="lm-s lm-o" d={bar.d} />}
        </g>
      ))}
      <line data-lm="target" className="lm-s lm-b lm-dashed" x1={plot.left} y1={CHART.target} x2={plot.right} y2={CHART.target} />
      <rect data-lm="target-tag" className="lm-s lm-b lm-pop" x={plot.right + 5} y={CHART.target - 5} width={20} height={10} rx={5} />
      <path data-lm="axes" className="lm-s lm-k2 lm-draw" pathLength="1" d={CHART.axes} />
      <path data-lm="trend" className="lm-s lm-o lm-draw" pathLength="1" d={CHART.trendPath} />
      {trend.map((p, i) => (
        <circle key={p.x} data-lm={`point-${i}`} className="lm-fo lm-pop" cx={p.x} cy={p.y} r={2.2} />
      ))}
      <circle data-lm="pulse" className="lm-s lm-o lm-pop" cx={last.x} cy={last.y} r={4} opacity={0} />
      <circle data-lm="tip" className="lm-fo" cx={trend[0].x} cy={trend[0].y} r={3} opacity={0} />
      <g data-lm="chip">
        <rect className="lm-s lm-k2 lm-fbg" x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={6} />
        {chip.lines.map((w, n) => (
          <rect key={w} data-lm={`chip-line-${n}`} className={`${n ? 'lm-fk' : 'lm-fo'} lm-type`} x={chip.x + 9} y={chip.y + 8 + n * 7} width={w} height={2} rx={1} fillOpacity={n ? 0.5 : 1} />
        ))}
      </g>
    </>
  );
};

// A loop of four ticked stations round a cycle mark, with the shortcut the token took
// when the third station showed a gap.
const Automation = () => {
  const gap = LOOP.stations[LOOP.gap];
  return (
    <>
      <path data-lm="track" className="lm-s lm-k2 lm-draw" pathLength="1" d={LOOP.track} />
      <path data-lm="shortcut" className="lm-s lm-o lm-dashed" d={LOOP.shortcut} opacity={0.35} />
      <path data-lm="run-first" className="lm-s lm-o lm-token" pathLength="1" d={LOOP.track} opacity={0} />
      <path data-lm="run-second" className="lm-s lm-o lm-token" pathLength="1" d={LOOP.track} opacity={0} />
      <path data-lm="run-back" className="lm-s lm-o lm-signal" pathLength="1" d={LOOP.shortcut} opacity={0} />
      <circle data-lm="done-halo" className="lm-s lm-o lm-pop" cx={LOOP.centre.x} cy={LOOP.centre.y} r={LOOP.centre.r} opacity={0} />
      <path data-lm="cycle" className="lm-s lm-k lm-pop" d={LOOP.cycle} />
      <circle data-lm="gap-pulse" className="lm-s lm-o lm-pop" cx={gap.x} cy={gap.y} r={12} opacity={0} />
      {LOOP.stations.map((st) => (
        <g key={st.k} data-lm={`station-${st.k}`} className="lm-pop">
          <circle className="lm-s lm-k lm-fbg" cx={st.x} cy={st.y} r={12} />
          <path data-lm={`tick-${st.k}`} className="lm-s lm-b lm-draw" pathLength="1" d={st.tick} />
        </g>
      ))}
      <circle data-lm="gap" className="lm-s lm-o lm-fbg" cx={gap.x} cy={gap.y} r={12} opacity={0} />
    </>
  );
};

const ART = {
  cloud: { Art: Cloud, label: 'Animation: packets travel up from a document, a person and a table into a cloud until it is full.' },
  ai: { Art: Ai, label: 'Animation: signals cross a small neural network, layer by layer, and light a spark at its output.' },
  analysis: { Art: Analysis, label: 'Animation: a bar chart grows and updates against a target line, then a trend line is drawn across it.' },
  automation: { Art: Automation, label: 'Animation: a token runs a loop of four stations; one shows a gap, so the token is sent back to the start and runs the loop again until every station is ticked.' },
};

/**
 * One of the home page's four line-art animations (see lineScenes.js): line drawings in
 * dark ink, orange and blue that draw themselves on a loop, straight on their section's
 * light background.
 *
 * The markup is the scene's finished picture, so that is what shows without JavaScript or
 * when the visitor has asked for reduced motion. Otherwise the loop plays while the drawing
 * is on screen. It joins the loop at the scene's `ready` moment (its fixed parts all in
 * place, the action about to start) and waits there while off screen, so however fast the
 * page is scrolled the drawing is whole when it arrives; every later turn of the loop draws
 * it again from an empty picture.
 */
export default function LineMotion({ scene }) {
  const ref = useRef(null);
  const { Art, label } = ART[scene];

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof root.animate !== 'function') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const { duration, ready, tracks } = SCENES[scene]();
    const timing = { duration: duration * 1000, iterations: Infinity };
    const animations = [];
    for (const { id, frames } of tracks) {
      const el = root.querySelector(`[data-lm="${id}"]`);
      if (el) animations.push(el.animate(toKeyframes(frames, duration), timing));
    }
    const rest = () => animations.forEach((a) => { a.pause(); a.currentTime = ready * 1000; });
    rest();

    // Play once a fifth of the drawing is showing, so that two drawings seldom run at once;
    // go back to the ready picture when it has left.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.2) animations.forEach((a) => a.play());
      else if (!entry.isIntersecting) rest();
    }, { threshold: [0, 0.2] });
    observer.observe(root);

    return () => {
      observer.disconnect();
      animations.forEach((a) => a.cancel());
    };
  }, [scene]);

  return (
    <div className="line-motion" ref={ref}>
      <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} role="img" aria-label={label}>
        <g data-lm="scene"><Art /></g>
      </svg>
    </div>
  );
}
