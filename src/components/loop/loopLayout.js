// The closed loop: what each product does, what it hands to the next one, and
// where the four cards sit on the canvas. Pure data, so it can be unit-tested.

import { APP_LOGOS } from '../appLogos.js'

/** `color` is the colour of the app's official logo; `ink` is a darker shade that stays readable as small text. */
export const STEPS = [
  {
    id: 'forge',
    name: 'Forge',
    verb: 'Build',
    sub: 'Builds MLR-compliant content',
    color: APP_LOGOS.forge.color,
    ink: '#b9502e',
    handoff: 'content published',
    detail: 'AI agents generate MLR-compliant content from your PI, CSRs, and brand assets, with every claim cited automatically.',
  },
  {
    id: 'cue',
    name: 'Cue',
    verb: 'Deliver',
    sub: 'Delivers adaptive learning',
    color: APP_LOGOS.cue.color,
    ink: '#5f6e3f',
    handoff: 'readiness reached',
    detail: 'Adaptive learning pathways deliver competency-targeted content and close knowledge gaps before reps reach the field.',
  },
  {
    id: 'stage',
    name: 'Stage',
    verb: 'Assess',
    sub: 'Assesses in live HCP roleplay',
    color: APP_LOGOS.stage.color,
    ink: '#2f6a85',
    handoff: 'competency demonstrated',
    detail: 'Live HCP roleplay assesses readiness with real-time compliance monitoring and behavioral scoring against benchmarks.',
  },
  {
    id: 'trace',
    name: 'Trace',
    verb: 'Verify',
    sub: 'Verifies behavioral competency',
    color: APP_LOGOS.trace.color,
    ink: '#4a6a6e',
    handoff: 'gap → rebuild',
    detail: 'Competency-gated certification verifies demonstrated field readiness. Gaps automatically trigger Forge to rebuild.',
  },
]

/** One edge per step, to the next step; the last one returns to the first and closes the loop. */
export function loopEdges() {
  return STEPS.map((step, i) => ({
    id: `${step.id}-next`,
    source: step.id,
    target: STEPS[(i + 1) % STEPS.length].id,
    label: step.handoff,
    returns: i === STEPS.length - 1,
  }))
}

const place = (width, height, spots) => spots.map(([id, x, y, inSide, outSide]) => ({ id, x, y, width, height, in: inSide, out: outSide }))

/**
 * Card positions in canvas units (1 unit = 1px at zoom 1). `in` and `out` are the
 * sides the incoming and outgoing edges attach to.
 *
 * ring:  the four cards sit on the middle of each side of a rounded track, clockwise.
 * stack: one column for phones. The return edge runs up a rail to the left of the
 *        column, outside these bounds, in padding the canvas leaves for it.
 */
export const LAYOUTS = {
  ring: {
    width: 496,
    height: 400,
    nodes: place(168, 96, [
      ['forge', 164, 0, 'left', 'right'],
      ['cue', 328, 152, 'top', 'bottom'],
      ['stage', 164, 304, 'right', 'left'],
      ['trace', 0, 152, 'bottom', 'top'],
    ]),
  },
  stack: {
    width: 268,
    height: 370,
    nodes: place(268, 58, [
      ['forge', 0, 0, 'left', 'bottom'],
      ['cue', 0, 104, 'top', 'bottom'],
      ['stage', 0, 208, 'top', 'bottom'],
      ['trace', 0, 312, 'top', 'left'],
    ]),
  },
}

/** How far from a card its edge label sits, centre to card edge. */
export const LABEL_GAP = 32

const isVertical = (side) => side === 'top' || side === 'bottom'

/**
 * Where the label of a corner edge sits: on the vertical run, LABEL_GAP from the
 * card at that end, which keeps it clear of the cards above and below.
 * Sides are 'top' | 'right' | 'bottom' | 'left' (React Flow's Position values).
 * Returns null for an edge with no corner; its own midpoint is the right place then.
 */
export function labelSpot({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition }) {
  const leavesVertically = isVertical(sourcePosition)
  const arrivesVertically = isVertical(targetPosition)
  if (leavesVertically === arrivesVertically) return null
  const [x, y, side] = leavesVertically ? [sourceX, sourceY, sourcePosition] : [targetX, targetY, targetPosition]
  return { x, y: y + (side === 'bottom' ? LABEL_GAP : -LABEL_GAP) }
}

/** Containers narrower than this get the stacked layout. Keep in step with the container query in styles.css. */
export const STACK_BELOW = 460

/** Which layout fits a container this wide; null until the container has been measured. */
export function pickLayout(containerWidth) {
  if (!containerWidth) return null
  return containerWidth < STACK_BELOW ? 'stack' : 'ring'
}
