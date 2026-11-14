import assert from 'node:assert/strict'
import { test } from 'node:test'

import { LABEL_GAP, LAYOUTS, STEPS, STACK_BELOW, labelSpot, loopEdges, pickLayout } from './loopLayout.js'

const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

test('the loop runs Forge, Cue, Stage, Trace in the site product colours', () => {
  assert.deepEqual(STEPS.map((s) => s.id), ['forge', 'cue', 'stage', 'trace'])
  assert.deepEqual(STEPS.map((s) => s.color), ['#f5825f', '#9ca979', '#5e6b7a', '#75abc0'])
  for (const step of STEPS) {
    for (const key of ['name', 'sub', 'icon', 'ink', 'handoff', 'detail']) {
      assert.ok(step[key], `${step.id} is missing ${key}`)
    }
  }
})

test('the edges form one closed loop, and only the last one returns to the start', () => {
  const edges = loopEdges()
  assert.equal(edges.length, STEPS.length)
  edges.forEach((edge, i) => {
    assert.equal(edge.source, STEPS[i].id)
    assert.equal(edge.target, STEPS[(i + 1) % STEPS.length].id)
    assert.equal(edge.label, STEPS[i].handoff)
    assert.equal(edge.returns, i === STEPS.length - 1)
  })
})

for (const [name, layout] of Object.entries(LAYOUTS)) {
  test(`${name} layout places every step inside its bounds without overlap`, () => {
    assert.deepEqual(layout.nodes.map((n) => n.id), STEPS.map((s) => s.id))
    for (const node of layout.nodes) {
      assert.ok(node.x >= 0 && node.y >= 0, `${node.id} starts outside the canvas`)
      assert.ok(node.x + node.width <= layout.width, `${node.id} is wider than the canvas`)
      assert.ok(node.y + node.height <= layout.height, `${node.id} is taller than the canvas`)
      assert.notEqual(node.in, node.out, `${node.id} takes and gives on the same side`)
    }
    layout.nodes.forEach((a, i) => {
      for (const b of layout.nodes.slice(i + 1)) assert.ok(!overlaps(a, b), `${a.id} overlaps ${b.id}`)
    })
  })
}

test('pickLayout stacks the loop on narrow containers and waits for a measurement', () => {
  assert.equal(pickLayout(STACK_BELOW - 1), 'stack')
  assert.equal(pickLayout(STACK_BELOW), 'ring')
  assert.equal(pickLayout(780), 'ring')
  assert.equal(pickLayout(0), null)
  assert.equal(pickLayout(undefined), null)
})

test('a corner edge carries its label on the vertical run, a fixed gap from the card at that end', () => {
  // leaves a card sideways, arrives at the top of the next one: the label sits above the target
  assert.deepEqual(
    labelSpot({ sourceX: 332, sourceY: 48, sourcePosition: 'right', targetX: 412, targetY: 152, targetPosition: 'top' }),
    { x: 412, y: 152 - LABEL_GAP },
  )
  // arrives from below
  assert.deepEqual(
    labelSpot({ sourceX: 164, sourceY: 352, sourcePosition: 'left', targetX: 84, targetY: 248, targetPosition: 'bottom' }),
    { x: 84, y: 248 + LABEL_GAP },
  )
  // leaves the bottom of a card, arrives sideways: the label sits below the source
  assert.deepEqual(
    labelSpot({ sourceX: 412, sourceY: 248, sourcePosition: 'bottom', targetX: 332, targetY: 352, targetPosition: 'right' }),
    { x: 412, y: 248 + LABEL_GAP },
  )
  // leaves the top
  assert.deepEqual(
    labelSpot({ sourceX: 84, sourceY: 152, sourcePosition: 'top', targetX: 164, targetY: 48, targetPosition: 'left' }),
    { x: 84, y: 152 - LABEL_GAP },
  )
})

test('an edge without a corner leaves the label to its midpoint', () => {
  assert.equal(labelSpot({ sourceX: 170, sourceY: 62, sourcePosition: 'bottom', targetX: 170, targetY: 108, targetPosition: 'top' }), null)
  assert.equal(labelSpot({ sourceX: 38, sourceY: 355, sourcePosition: 'left', targetX: 38, targetY: 31, targetPosition: 'left' }), null)
})
