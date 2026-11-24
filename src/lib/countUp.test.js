import assert from 'node:assert/strict'
import { test } from 'node:test'

import { figureAt, parseFigure } from './countUp.js'

// Every figure the pages show today, plus the shapes a case study in the CMS may use.
const COUNTED = ['80–95%', '11 mo', '84%', '25 yrs', '23%', '3 wks', '6 mo', '+87%', '−72%', '3.8×', '100%', '5,000+', '6 wks', '3', '4+', '30+', '$1.2M', '2x']

test('a figure starts from zero and ends as written', () => {
  for (const text of COUNTED) {
    const parts = parseFigure(text)
    assert.ok(parts, `${text} should count`)
    assert.equal(figureAt(parts, 1), text)
    assert.notEqual(figureAt(parts, 0), text)
    assert.doesNotMatch(figureAt(parts, 0), /[1-9]/, `${text} should start at zero`)
  }
})

test('everything around the number stays in place while it counts', () => {
  assert.equal(figureAt(parseFigure('84%'), 0), '0%')
  assert.equal(figureAt(parseFigure('84%'), 0.5), '42%')
  assert.equal(figureAt(parseFigure('11 mo'), 0), '0 mo')
  assert.equal(figureAt(parseFigure('+87%'), 0), '+0%')
  assert.equal(figureAt(parseFigure('−72%'), 0.5), '−36%')
  assert.equal(figureAt(parseFigure('$1.2M'), 0.5), '$0.6M')
})

test('both ends of a range count together', () => {
  const range = parseFigure('80–95%')
  assert.equal(figureAt(range, 0), '0–0%')
  assert.equal(figureAt(range, 0.2), '16–19%')
  assert.equal(figureAt(range, 1), '80–95%')
})

test('decimals and thousands separators are kept all the way', () => {
  assert.equal(figureAt(parseFigure('3.8×'), 0), '0.0×')
  assert.equal(figureAt(parseFigure('3.8×'), 0.5), '1.9×')
  assert.equal(figureAt(parseFigure('5,000+'), 0), '0+')
  assert.equal(figureAt(parseFigure('5,000+'), 0.5), '2,500+')
  assert.equal(figureAt(parseFigure('5000'), 0.5), '2500')
})

test('progress outside 0 to 1 is held at the ends', () => {
  const parts = parseFigure('30+')
  assert.equal(figureAt(parts, -1), '0+')
  assert.equal(figureAt(parts, 2), '30+')
})

test('text with nothing to count is left alone', () => {
  for (const text of ['LMS', 'Only', '', '0', '1st', '2nd', '3rd', '4th', '21st']) {
    assert.equal(parseFigure(text), null, `"${text}" should not count`)
  }
  assert.equal(parseFigure(undefined), null)
  assert.equal(parseFigure(42), null)
})

test('a rank beside a quantity stays as written while the quantity counts', () => {
  const parts = parseFigure('1st of 30')
  assert.equal(figureAt(parts, 0), '1st of 0')
  assert.equal(figureAt(parts, 1), '1st of 30')
})
