import assert from 'node:assert/strict'
import { test } from 'node:test'

import { SCREENS } from './images.js'
import { PRODUCT_TOUR, stepIndex, swipeStep } from './productTour.js'

test('the tour shows the four products in the order of the loop', () => {
  assert.deepEqual(PRODUCT_TOUR.map((slide) => slide.id), ['forge', 'cue', 'stage', 'trace'])
})

test('every slide has a name, a description, an address and screens that exist', () => {
  for (const slide of PRODUCT_TOUR) {
    assert.match(slide.name, /^Proxa (Forge|Cue|Stage|Trace)$/)
    assert.ok(slide.body.length > 30, `${slide.id} needs a description of what its screen shows`)
    assert.equal(slide.url, `${slide.id}.proxalabs.com`)
    for (const screen of [slide.desktop, slide.mobile]) {
      assert.ok(screen.startsWith(`${slide.id}-`), `${slide.id} must show its own product, not ${screen}`)
      assert.ok(SCREENS[screen], `${slide.id}: no screen called ${screen}`)
    }
  }
})

test('the screens share one size per device, so the frame never jumps between slides', () => {
  for (const device of ['desktop', 'mobile']) {
    const sizes = new Set(PRODUCT_TOUR.map((slide) => `${SCREENS[slide[device]].width}x${SCREENS[slide[device]].height}`))
    assert.equal(sizes.size, 1, `${device} screens differ in size: ${[...sizes].join(', ')}`)
  }
})

test('stepIndex moves through the slides and wraps at both ends', () => {
  assert.equal(stepIndex(0, 1, 4), 1)
  assert.equal(stepIndex(3, 1, 4), 0)
  assert.equal(stepIndex(0, -1, 4), 3)
  assert.equal(stepIndex(2, -1, 4), 1)
})

test('swipeStep reads a sideways swipe and ignores taps and vertical scrolls', () => {
  assert.equal(swipeStep(-80, 5), 1, 'a swipe to the left shows the next slide')
  assert.equal(swipeStep(80, -10), -1, 'a swipe to the right shows the previous slide')
  assert.equal(swipeStep(-20, 0), 0, 'too short to be a swipe')
  assert.equal(swipeStep(-60, 90), 0, 'mostly vertical: the visitor is scrolling the page')
})
