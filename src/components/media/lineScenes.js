// The drawings and the timing of the home page's four line-art animations (LineMotion.jsx).
// Everything here is plain data, so it can be checked without a browser.
//
// Each scene is line art in three colours (dark ink, the brand orange and a cool blue),
// drawn in a 450 × 300 box and played as its own loop:
//   cloud      three sources send packets up into a cloud until it is full
//   ai         signals cross a small neural network to a spark, three times
//   analysis   a bar chart grows, updates against a target, and a trend line is drawn over it
//   automation a token runs a loop of four stations; one shows a gap, so it is sent back to
//              the start by a shortcut and runs the loop again, this time clean

export const VIEW = { w: 450, h: 300 }

const OUT = 'cubic-bezier(.22,1,.36,1)'
const IN_OUT = 'cubic-bezier(.65,0,.35,1)'

/**
 * Keyframes for element.animate() from `[seconds, values, easing?]` rows. The first and
 * last values are held to the ends of the loop; an easing covers the stretch after its row.
 */
export function toKeyframes(frames, duration) {
  const out = frames.map(([t, values, easing]) => ({ ...values, offset: t / duration, ...(easing ? { easing } : {}) }))
  const [first] = frames
  const last = frames[frames.length - 1]
  if (first[0] > 0) out.unshift({ ...first[1], offset: 0 })
  if (last[0] < duration) out.push({ ...last[1], offset: 1 })
  return out
}

// The values most parts move between.
const pop = (opacity, scale) => ({ opacity, transform: `scale(${scale})` })
const lift = (opacity, y) => ({ opacity, transform: `translateY(${y}px)` })

// Whole tracks that many parts share. Each scene fades out at `exit`, so its loop starts
// again from an empty picture.
const sceneTrack = (exit) => ({ id: 'scene', frames: [[0, { opacity: 1 }], [exit, { opacity: 1 }, 'ease-in'], [exit + 0.6, { opacity: 0 }]] })
const fadeIn = (id, at, time = 0.4) => ({ id, frames: [[at, { opacity: 0 }, 'ease-out'], [at + time, { opacity: 1 }]] })
const popIn = (id, at, time = 0.3) => ({ id, frames: [[at, pop(0, 0.3), OUT], [at + time, pop(1, 1)]] })
// A line that draws itself from its start. It is hidden until then, so its round end does
// not show as a dot.
const drawOn = (id, from, to, easing = IN_OUT) => ({ id, frames: [
  [from - 0.01, { opacity: 0, strokeDashoffset: 1 }], [from, { opacity: 1, strokeDashoffset: 1 }, easing], [to, { opacity: 1, strokeDashoffset: 0 }],
] })
// A ring that swells and fades from `at`, once for each time given.
const ringOut = (id, times, grow, time = 0.8) => ({ id, frames: times.flatMap((at) => [
  [at - 0.01, pop(0, 1)], [at, pop(0.8, 1), OUT], [at + time, pop(0, grow)],
]) })
// A part that swells and settles at each time given, after arriving at `at`.
const beat = (id, at, times, peak = 1.7, rest = 1) => ({ id, frames: [
  [at, pop(0, 0.3), OUT], [at + 0.25, pop(rest, 1)],
  ...times.flatMap((t) => [[t, pop(rest, 1), 'ease-out'], [t + 0.14, pop(1, peak), 'ease-in-out'], [t + 0.5, pop(rest, 1)]]),
] })

// A line through `points`, and how far along it each point lies (0 at the start, 1 at the end).
const pathOf = (points) => points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('')
function sharesOf(points) {
  const along = [0]
  for (let i = 1; i < points.length; i++) along.push(along[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y))
  return along.map((d) => d / along[along.length - 1])
}
// The dot at the tip of a line as it is drawn from `from` to `to`: it is placed on the first
// point and moved through the others at the pace the line is drawn.
function tipTrack(id, points, shares, [from, to], stay) {
  const at = (p) => `translate(${p.x - points[0].x}px, ${p.y - points[0].y}px)`
  const last = points[points.length - 1]
  return { id, frames: [
    [from - 0.01, { opacity: 0, transform: at(points[0]) }],
    ...points.map((p, i) => [from + shares[i] * (to - from), { opacity: 1, transform: at(p) }]),
    [to + 0.2, { opacity: stay ? 1 : 0, transform: at(last) }],
  ] }
}

// ── 1. Cloud ─────────────────────────────────────────────────────────────────────────────

const FEEDS = [{ x: 165, tone: 'blue' }, { x: 225, tone: 'orange' }, { x: 285, tone: 'ink' }]
const FEED = { top: 148, bottom: 208 }

export const CLOUD = {
  // Three circles standing on a flat base.
  outline: 'M162 142A30 30 0 1 1 170 83.1A46 46 0 0 1 260.3 71.5A38 38 0 1 1 280 142Z',
  // A dotted line up from each source, and the packets that travel it.
  feeds: FEEDS.map((feed, j) => ({ ...feed, j, y1: FEED.bottom, y2: FEED.top })),
  // Ten places inside the cloud. Each is filled by one packet, in its feed's colour.
  slots: Array.from({ length: 10 }, (_, n) => ({
    n, feed: n % 3, tone: FEEDS[n % 3].tone, from: { x: FEEDS[n % 3].x, y: FEED.bottom },
    x: 197 + (n % 5) * 14, y: 99 + Math.floor(n / 5) * 14,
  })),
}

function cloud() {
  const leave = (n) => 1.15 + Math.floor(n / 3) * 0.62 + (n % 3) * 0.2
  const flight = 0.6
  const full = leave(CLOUD.slots.length - 1) + flight + 0.25
  const wave = full + 0.75 // a last ripple across the filled places
  const tracks = [sceneTrack(wave + 0.5), drawOn('cloud', 0.1, 1.0), ringOut('cloud-halo', [full], 1.12, 0.9)]
  for (const feed of CLOUD.feeds) {
    // A source arrives dim and brightens each time it sends a packet.
    const frames = [[0.35 + feed.j * 0.15, lift(0, 6), OUT], [0.75 + feed.j * 0.15, lift(0.7, 0)]]
    for (const slot of CLOUD.slots.filter((s) => s.feed === feed.j)) {
      const t = leave(slot.n)
      frames.push([t - 0.06, lift(0.7, 0), 'ease-out'], [t + 0.08, lift(1, 0), 'ease-in-out'], [t + 0.45, lift(0.7, 0)])
    }
    tracks.push({ id: `source-${feed.j}`, frames }, fadeIn(`feed-${feed.j}`, 0.8 + feed.j * 0.1, 0.35))
  }
  for (const slot of CLOUD.slots) {
    const t = leave(slot.n)
    const land = t + flight
    tracks.push(fadeIn(`slot-${slot.n}`, 0.9 + slot.n * 0.03, 0.3))
    // The packet climbs its feed and slips in under the cloud's base.
    tracks.push({ id: `packet-${slot.n}`, frames: [
      [t - 0.01, lift(0, 0)], [t, lift(1, 0), IN_OUT], [land, lift(1, 136 - FEED.bottom)], [land + 0.1, lift(0, 128 - FEED.bottom)],
    ] })
    tracks.push(beat(`fill-${slot.n}`, land, [full, wave + (slot.n % 5) * 0.05]))
  }
  return { duration: wave + 1.3, ready: 1.1, tracks }
}

// ── 2. AI ────────────────────────────────────────────────────────────────────────────────

const LAYER_X = [95, 175, 255]
const LAYER_Y = [[96, 132, 168, 204], [78, 114, 150, 186, 222], [96, 132, 168, 204]]
const OUTPUT = { x: 345, y: 150, r: 17 }
const nodeAt = (layer, i) => (layer === 3 ? OUTPUT : { x: LAYER_X[layer], y: LAYER_Y[layer][i] })
const HOP = 0.38 // from one layer to the next
// Three passes through the network. Each hop lists the links that carry a signal, as
// [node in this layer, node in the next]; the last hop ends on the one output.
export const PASSES = [
  { start: 1.0, tone: 'blue', hops: [[[0, 1], [0, 2], [2, 2], [2, 3]], [[1, 0], [2, 1], [2, 2], [3, 2]], [[0, 0], [1, 0], [2, 0]]] },
  { start: 2.1, tone: 'blue', hops: [[[1, 0], [1, 2], [3, 3], [3, 4]], [[0, 0], [2, 1], [3, 3], [4, 3]], [[0, 0], [1, 0], [3, 0]]] },
  { start: 3.2, tone: 'orange', hops: [[[0, 0], [1, 1], [1, 2], [2, 2], [2, 3], [3, 4]], [[0, 0], [1, 1], [2, 1], [2, 2], [3, 2], [4, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]]] },
]
const ANSWER = PASSES[2].start + 3 * HOP // when the last pass reaches the output
const ECHO = ANSWER + 0.3 // an orange ripple then runs back through the layers

// When each node lights, per colour: as a signal leaves it, and again in the ripple back.
const glowTimes = new Map()
const glow = (tone, layer, i, at) => {
  const id = `${tone}-${layer}-${i}`
  if (!glowTimes.has(id)) glowTimes.set(id, { id, tone, ...nodeAt(layer, i), times: [] })
  glowTimes.get(id).times.push(at)
}
for (const pass of PASSES) {
  pass.hops.forEach((links, layer) => {
    for (const i of new Set(links.map(([from]) => from))) glow(pass.tone, layer, i, pass.start + layer * HOP)
  })
}
LAYER_Y.forEach((ys, layer) => ys.forEach((_, i) => glow('orange', layer, i, ECHO + (2 - layer) * 0.14)))

export const NET = {
  nodes: LAYER_Y.flatMap((ys, layer) => ys.map((y, i) => ({ id: `${layer}-${i}`, layer, i, x: LAYER_X[layer], y }))),
  // Every node is joined to every node of the next layer.
  links: [0, 1, 2].flatMap((hop) => LAYER_Y[hop].flatMap((_, a) => (
    (hop === 2 ? [0] : LAYER_Y[hop + 1].map((__, b) => b)).map((b) => ({ id: `${hop}-${a}-${b}`, hop, from: nodeAt(hop, a), to: nodeAt(hop + 1, b) }))
  ))),
  signals: PASSES.flatMap((pass, p) => pass.hops.flatMap((links, hop) => links.map(([a, b]) => ({
    id: `${p}-${hop}-${a}-${b}`, tone: pass.tone, at: pass.start + hop * HOP, from: nodeAt(hop, a), to: nodeAt(hop + 1, b),
  })))),
  glows: [...glowTimes.values()],
  output: OUTPUT,
}

function ai() {
  const arrivals = PASSES.map((pass) => pass.start + 3 * HOP)
  const tracks = [sceneTrack(ECHO + 0.95)]
  for (const node of NET.nodes) tracks.push(popIn(`node-${node.id}`, 0.1 + node.layer * 0.14 + node.i * 0.03))
  for (const hop of [0, 1, 2]) tracks.push(fadeIn(`links-${hop}`, 0.35 + hop * 0.15))
  // A signal is a short dash that runs the length of its link.
  for (const s of NET.signals) {
    tracks.push({ id: `signal-${s.id}`, frames: [
      [s.at - 0.01, { opacity: 0, strokeDashoffset: 0.35 }], [s.at, { opacity: 1, strokeDashoffset: 0.35 }, 'ease-in-out'],
      [s.at + 0.42, { opacity: 1, strokeDashoffset: -1 }], [s.at + 0.43, { opacity: 0, strokeDashoffset: -1 }],
    ] })
  }
  for (const g of NET.glows) {
    tracks.push({ id: `glow-${g.id}`, frames: g.times.flatMap((t) => [[t - 0.02, { opacity: 0 }, 'ease-out'], [t + 0.1, { opacity: 1 }, 'ease-in-out'], [t + 0.55, { opacity: 0 }]]) })
  }
  // The output: its ring flashes blue for the first two passes and stays orange after the
  // third; the spark inside turns a quarter each time and is filled at the end.
  const turn = (deg, scale) => `rotate(${deg}deg) scale(${scale})`
  tracks.push(
    popIn('out-ring', 0.55),
    { id: 'out-blue', frames: arrivals.slice(0, 2).flatMap((t) => [[t - 0.02, { opacity: 0 }, 'ease-out'], [t + 0.1, { opacity: 1 }, 'ease-in-out'], [t + 0.6, { opacity: 0 }]]) },
    { id: 'out-orange', frames: [[ANSWER - 0.02, { opacity: 0 }, 'ease-out'], [ANSWER + 0.15, { opacity: 1 }]] },
    { id: 'spark', frames: [
      [0.7, { opacity: 0, transform: turn(0, 0.3) }, OUT], [1.0, { opacity: 1, transform: turn(0, 1) }],
      ...arrivals.flatMap((t, n) => [
        [t, { opacity: 1, transform: turn(n * 90, 1) }, 'ease-out'], [t + 0.18, { opacity: 1, transform: turn(n * 90 + 45, 1.4) }, 'ease-in-out'],
        [t + 0.55, { opacity: 1, transform: turn(n * 90 + 90, 1) }],
      ]),
    ] },
    fadeIn('spark-fill', ANSWER, 0.2),
    ringOut('out-halo', [ANSWER], 1.8, 0.9),
    popIn('plus', ANSWER + 0.15),
  )
  return { duration: ECHO + 1.75, ready: PASSES[0].start, tracks }
}

// ── 3. Analysis ──────────────────────────────────────────────────────────────────────────

const PLOT = { left: 70, right: 384, top: 56, base: 230 }
const BAR = { first: 87, step: 34, w: 12 }
const HEIGHTS = { before: [52, 78, 64, 96, 84, 118, 104, 138, 126], now: [60, 70, 82, 90, 104, 110, 126, 132, 150] }
const TARGET = 118 // the dashed line the bars are measured against, as a height on the page
// A bar open at the bottom, with its top corners rounded.
const barPath = (x, top) => `M${x} ${PLOT.base}V${top + 2}Q${x} ${top} ${x + 2} ${top}H${x + BAR.w - 2}Q${x + BAR.w} ${top} ${x + BAR.w} ${top + 2}V${PLOT.base}`

const TREND = HEIGHTS.now.map((h, i) => ({ x: BAR.first + i * BAR.step, y: PLOT.base - h - 16 }))
export const CHART = {
  plot: PLOT,
  axes: `M${PLOT.left} ${PLOT.top}V${PLOT.base}H${PLOT.right}`,
  grid: [187.5, 145, 102.5, 60],
  target: TARGET,
  // Each bar is drawn at its height now; `before` is the height it first grows to.
  bars: HEIGHTS.now.map((h, i) => {
    const top = PLOT.base - h
    return { i, h, before: HEIGHTS.before[i], over: top < TARGET, d: barPath(BAR.first + i * BAR.step - BAR.w / 2, top) }
  }),
  trend: TREND,
  trendPath: pathOf(TREND),
  shares: sharesOf(TREND),
  chip: { x: 296, y: 22, w: 54, h: 26, lines: [26, 16] },
}

function analysis() {
  const grow = (i) => 0.5 + i * 0.06
  const update = (i) => 2.2 + i * 0.04
  const run = [2.9, 3.9] // the trend line being drawn
  const reach = (i) => run[0] + CHART.shares[i] * (run[1] - run[0])
  const tracks = [sceneTrack(5.1), drawOn('axes', 0.1, 0.7), ...CHART.grid.map((_, n) => fadeIn(`grid-${n}`, 0.3 + n * 0.08, 0.3))]
  for (const bar of CHART.bars) {
    const before = { transform: `scaleY(${(bar.before / bar.h).toFixed(3)})` }
    tracks.push({ id: `bar-${bar.i}`, frames: [
      [grow(bar.i), { transform: 'scaleY(0)' }, OUT], [grow(bar.i) + 0.5, before],
      [update(bar.i), before, IN_OUT], [update(bar.i) + 0.5, { transform: 'scaleY(1)' }],
    ] })
    // A bar that ends above the target is redrawn in orange as it gets there.
    if (bar.over) tracks.push(fadeIn(`over-${bar.i}`, update(bar.i) + 0.3, 0.3))
  }
  tracks.push(
    fadeIn('target', 1.5),
    popIn('target-tag', 1.8),
    drawOn('trend', run[0], run[1], 'linear'),
    tipTrack('tip', CHART.trend, CHART.shares, run, true),
    ...CHART.trend.map((_, i) => popIn(`point-${i}`, reach(i), 0.25)),
    ringOut('pulse', [run[1], run[1] + 0.75], 3.2, 0.7),
    { id: 'chip', frames: [[run[1] + 0.05, lift(0, 6), OUT], [run[1] + 0.4, lift(1, 0)]] },
    ...CHART.chip.lines.map((_, n) => ({ id: `chip-line-${n}`, frames: [
      [run[1] + 0.3 + n * 0.12, { transform: 'scaleX(0)' }, OUT], [run[1] + 0.65 + n * 0.12, { transform: 'scaleX(1)' }],
    ] })),
  )
  return { duration: 5.9, ready: grow(CHART.bars.length - 1) + 0.5, tracks }
}

// ── 4. Automation ────────────────────────────────────────────────────────────────────────

// The dash that stands for the token, as a share of the loop. The loop's path starts at the
// left station and runs clockwise, so the stations sit at each quarter of it.
const TOKEN = 0.07
const STATIONS = [{ x: 95, y: 150 }, { x: 225, y: 80 }, { x: 355, y: 150 }, { x: 225, y: 220 }]

export const LOOP = {
  track: 'M95 150V120A40 40 0 0 1 135 80H315A40 40 0 0 1 355 120V180A40 40 0 0 1 315 220H135A40 40 0 0 1 95 180Z',
  stations: STATIONS.map((at, k) => ({ ...at, k, tick: `M${at.x - 4.5} ${at.y + 0.5}l3 3l6 -6.5` })),
  gap: 3, // the station where the first run stops
  // The shortcut from that station back to the start.
  shortcut: `M${STATIONS[3].x} ${STATIONS[3].y}L${STATIONS[0].x} ${STATIONS[0].y}`,
  centre: { x: 225, y: 150, r: 22 },
  // Two curved arrows chasing each other round the centre.
  cycle: 'M210 144.5A16 16 0 0 1 240 144.5M241.6 138.7L240 144.5L235.1 141.1M240 155.5A16 16 0 0 1 210 155.5M208.4 161.3L210 155.5L214.9 158.9',
}

function automation() {
  const first = { run: [0.9, 2.26], to: 0.75 } // the first run, as far as the third quarter
  const back = [2.6, 3.1] // along the shortcut
  const second = { run: [3.1, 4.65], to: 1 } // then the whole loop
  const finish = second.run[1] + 0.15
  const exit = finish + 0.8
  // When the front of the token reaches a given share of the loop during a run.
  const pass = ({ run, to }, share) => run[0] + ((share - TOKEN) / (to - TOKEN)) * (run[1] - run[0])
  const runTrack = (id, { run, to }) => ({ id, frames: [
    [run[0] - 0.15, { opacity: 0, strokeDashoffset: 0 }], [run[0], { opacity: 1, strokeDashoffset: 0 }, 'linear'],
    [run[1], { opacity: 1, strokeDashoffset: TOKEN - to }], [run[1] + 0.15, { opacity: 0, strokeDashoffset: TOKEN - to }],
  ] })
  const stopped = first.run[1]
  const cleared = pass(second, 0.75)
  const spin = (deg, scale) => `rotate(${deg}deg) scale(${scale})`
  return { duration: exit + 0.8, ready: first.run[0], tracks: [
    sceneTrack(exit),
    drawOn('track', 0.1, 0.9),
    // The cycle mark in the middle turns for as long as the loop is running.
    { id: 'cycle', frames: [
      [0.6, { opacity: 0, transform: spin(0, 0.3) }, OUT], [0.9, { opacity: 1, transform: spin(0, 1) }, 'linear'],
      [exit, { opacity: 1, transform: spin(720, 1) }],
    ] },
    // Each station arrives, answers when the token passes it a second time, and they all
    // answer in turn at the end.
    beat('station-0', 0.3, [finish], 1.25),
    beat('station-1', 0.4, [pass(second, 0.25), finish + 0.06], 1.25),
    beat('station-2', 0.5, [pass(second, 0.5), finish + 0.12], 1.25),
    beat('station-3', 0.6, [finish + 0.18], 1.25),
    drawOn('tick-1', pass(first, 0.25), pass(first, 0.25) + 0.25, OUT),
    drawOn('tick-2', pass(first, 0.5), pass(first, 0.5) + 0.25, OUT),
    runTrack('run-first', first),
    // The gap: the third station turns orange until the second run clears it.
    { id: 'gap', frames: [
      [stopped - 0.02, { opacity: 0 }, 'ease-out'], [stopped + 0.12, { opacity: 1 }],
      [cleared, { opacity: 1 }, 'ease-out'], [cleared + 0.2, { opacity: 0 }],
    ] },
    ringOut('gap-pulse', [stopped, stopped + 0.75], 2.6, 0.7),
    { id: 'shortcut', frames: [
      [stopped + 0.15, { opacity: 0 }, 'ease-out'], [stopped + 0.4, { opacity: 1 }],
      [back[1] + 0.1, { opacity: 1 }, 'ease-in-out'], [back[1] + 0.5, { opacity: 0.35 }],
    ] },
    { id: 'run-back', frames: [
      [back[0] - 0.01, { opacity: 0, strokeDashoffset: 0.35 }], [back[0], { opacity: 1, strokeDashoffset: 0.35 }, 'ease-in-out'],
      [back[1], { opacity: 1, strokeDashoffset: -1 }], [back[1] + 0.01, { opacity: 0, strokeDashoffset: -1 }],
    ] },
    runTrack('run-second', second),
    drawOn('tick-3', cleared + 0.02, cleared + 0.27, OUT),
    drawOn('tick-0', second.run[1], second.run[1] + 0.25, OUT),
    ringOut('done-halo', [finish], 2.4, 0.9),
  ] }
}

/**
 * The four scenes. Calling one gives how long its loop lasts, every moving part (the
 * `data-lm` name of its element with its `[seconds, values, easing?]` rows) and `ready`:
 * the moment its fixed parts have all arrived and the action is about to start. A drawing
 * that scrolls into view joins its loop there, so it is never an empty picture on arrival.
 */
export const SCENES = { cloud, ai, analysis, automation }
