import assert from 'node:assert/strict'
import { test } from 'node:test'

import { clientIp, escapeHtml, isOverLimit, nextWindow, signToken, singleLine, verifyToken } from './security.js'

const SECRET = 'test-secret'
const MIN = 60 * 1000

test('a signed token verifies and returns its payload', () => {
  const token = signToken({ file: 42 }, SECRET, 15 * MIN, 1000)
  assert.deepEqual(verifyToken(token, SECRET, 1000 + 14 * MIN), { file: 42 })
})

test('an expired token is rejected', () => {
  const token = signToken({ file: 42 }, SECRET, 15 * MIN, 1000)
  assert.equal(verifyToken(token, SECRET, 1000 + 15 * MIN + 1), null)
})

test('a tampered token is rejected', () => {
  const token = signToken({ file: 42 }, SECRET, 15 * MIN, 1000)
  const [body, sig] = token.split('.')
  const forged = Buffer.from(JSON.stringify({ p: { file: 43 }, exp: 1000 + 15 * MIN })).toString('base64url')
  assert.equal(verifyToken(`${forged}.${sig}`, SECRET, 2000), null)
  assert.equal(verifyToken(`${body}.${sig.slice(0, -2)}aa`, SECRET, 2000), null)
})

test('a token signed with another secret, or garbage, is rejected', () => {
  assert.equal(verifyToken(signToken({ file: 1 }, 'other', MIN, 0), SECRET, 1), null)
  for (const junk of ['', 'abc', 'a.b.c', null, undefined, 123]) assert.equal(verifyToken(junk, SECRET, 1), null)
})

test('the rate window counts up and resets after it elapses', () => {
  const w = 15 * MIN
  assert.deepEqual(nextWindow(null, 5000, w), { count: 1, first: 5000 })
  assert.deepEqual(nextWindow({ count: 3, first: 5000 }, 5000 + w, w), { count: 4, first: 5000 })
  assert.deepEqual(nextWindow({ count: 12, first: 5000 }, 5000 + w + 1, w), { count: 1, first: 5000 + w + 1 })
})

test('12 per address and 300 overall are allowed; the next one is not', () => {
  assert.equal(isOverLimit({ count: 12 }, { count: 300 }), false)
  assert.equal(isOverLimit({ count: 13 }, { count: 5 }), true)
  assert.equal(isOverLimit({ count: 1 }, { count: 301 }), true)
})

test('escapeHtml neutralises markup in a notification email', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')
  assert.equal(escapeHtml("Tom & Jerry's"), 'Tom &amp; Jerry&#39;s')
  assert.equal(escapeHtml(null), '')
})

test('singleLine stops header injection through a subject', () => {
  assert.equal(singleLine('Jane\r\nBcc: evil@example.com'), 'Jane Bcc: evil@example.com')
  assert.equal(singleLine(undefined), '')
})

test('clientIp takes the last forwarded address, which the proxy appended', () => {
  const h = (v) => new Headers(v ? { 'x-forwarded-for': v } : {})
  assert.equal(clientIp(h('1.1.1.1, 203.0.113.9')), '203.0.113.9')
  assert.equal(clientIp(h('2001:db8::1')), '2001:db8::1')
  assert.equal(clientIp(h('')), 'unknown')
  assert.equal(clientIp(h('evil key/with$chars')), 'evil_key_with_chars')
})
