import assert from 'node:assert/strict'
import { test } from 'node:test'

import { CHART, CLOUD, LOOP, NET, PASSES, SCENES, VIEW, toKeyframes } from './lineScenes.js'

const inView = (x, y) => x >= 0 && x <= VIEW.w && y >= 0 && y <= VIEW.h

test('toKeyframes turns seconds into offsets and holds the first and last values to the ends of the loop', () => {
  const frames = toKeyframes([[2, { opacity: 0 }, 'ease-out'], [4, { opacity: 1 }]], 8)
  assert.deepEqual(frames, [
    { opacity: 0, offset: 0 },
    { opacity: 0, offset: 0.25, easing: 'ease-out' },
    { opacity: 1, offset: 0.5 },
    { opacity: 1, offset: 1 },
  ])
})

test('toKeyframes adds nothing when the frames already reach both ends', () => {
  const frames = toKeyframes([[0, { opacity: 0 }], [8, { opacity: 1 }]], 8)
  assert.deepEqual(frames.map((f) => f.offset), [0, 1])
})

test('there are four scenes: cloud, AI, analysis, automation', () => {
  assert.deepEqual(Object.keys(SCENES), ['cloud', 'ai', 'analysis', 'automation'])
})

for (const [name, scene] of Object.entries(SCENES)) {
  const { duration, tracks } = scene()

  test(`${name}: every track names one element once and gives keyframes the browser will accept`, () => {
    assert.equal(new Set(tracks.map((t) => t.id)).size, tracks.length, 'ids are unique')
    for (const { id, frames } of tracks) {
      const offsets = toKeyframes(frames, duration).map((f) => f.offset)
      assert.equal(offsets[0], 0, id)
      assert.equal(offsets[offsets.length - 1], 1, `${id} runs past the end of the loop`)
      for (let i = 1; i < offsets.length; i++) assert.ok(offsets[i] >= offsets[i - 1], `${id}: frame ${i} goes back in time`)
      // One property list per track, so every pair of frames can be blended.
      const props = Object.keys(frames[0][1]).sort().join()
      for (const [, values] of frames) assert.equal(Object.keys(values).sort().join(), props, id)
    }
  })

  test(`${name}: by the time it is ready its fixed parts have arrived, and it stays whole for most of the loop`, () => {
    const { ready } = scene()
    const fade = tracks.find((t) => t.id === 'scene').frames.find(([, values]) => values.opacity === 0)[0] - 0.6
    assert.ok(ready > 0 && ready < 2, 'ready comes early in the loop')
    assert.ok(fade - ready > duration / 2, 'the picture is whole for more than half the loop')
    // Everything that draws itself or grows from nothing at the start has finished by then.
    for (const { id, frames } of tracks) {
      const [first, second] = frames
      const hidden = first[1].opacity === 0 || first[1].transform === 'scaleY(0)'
      if (hidden && first[0] < 0.75) assert.ok(second[0] <= ready + 0.4, `${id} is still arriving at ${second[0]}s`)
    }
  })

  test(`${name}: the picture is empty at the end of the loop, so it repeats without a jump`, () => {
    const frames = toKeyframes(tracks.find((t) => t.id === 'scene').frames, duration)
    assert.equal(frames[frames.length - 1].opacity, 0)
  })
}

test('cloud: each place inside it is filled by one packet from one of the three sources, and all are in view', () => {
  assert.equal(CLOUD.feeds.length, 3)
  for (const slot of CLOUD.slots) {
    assert.equal(slot.from.x, CLOUD.feeds[slot.feed].x)
    assert.equal(slot.tone, CLOUD.feeds[slot.feed].tone)
    assert.ok(inView(slot.x, slot.y), `slot ${slot.n}`)
  }
})

test('ai: a signal only leaves a node that the hop before it reached', () => {
  for (const pass of PASSES) {
    for (let hop = 1; hop < pass.hops.length; hop++) {
      const reached = new Set(pass.hops[hop - 1].map(([, to]) => to))
      for (const [from] of pass.hops[hop]) assert.ok(reached.has(from), `pass at ${pass.start}s, hop ${hop}, node ${from}`)
    }
  }
  assert.equal(NET.links.length, 4 * 5 + 5 * 4 + 4)
  for (const node of NET.nodes) assert.ok(inView(node.x, node.y), node.id)
})

test('analysis: the bars drawn in orange are exactly those above the target, and the trend clears every bar', () => {
  assert.ok(CHART.bars.some((b) => b.over) && CHART.bars.some((b) => !b.over))
  CHART.bars.forEach((bar, i) => {
    const top = CHART.plot.base - bar.h
    assert.equal(bar.over, top < CHART.target, `bar ${i}`)
    assert.ok(CHART.trend[i].y < top && CHART.trend[i].y > CHART.plot.top, `trend point ${i}`)
  })
  assert.equal(CHART.shares[0], 0)
  assert.equal(CHART.shares[CHART.shares.length - 1], 1)
})

test('automation: four stations in view, the shortcut joins the gap station to the start, and every tick is drawn', () => {
  assert.equal(LOOP.stations.length, 4)
  for (const station of LOOP.stations) assert.ok(inView(station.x - 12, station.y - 12) && inView(station.x + 12, station.y + 12), `station ${station.k}`)
  const [start, gap] = [LOOP.stations[0], LOOP.stations[LOOP.gap]]
  assert.equal(LOOP.shortcut, `M${gap.x} ${gap.y}L${start.x} ${start.y}`)
  const ids = SCENES.automation().tracks.map((t) => t.id)
  for (const station of LOOP.stations) assert.ok(ids.includes(`tick-${station.k}`), `tick ${station.k}`)
})
