import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'

import { CLIENT_LOGOS } from './clientLogos.js'

test('every client logo has a name, its file, its size and where it came from', () => {
  assert.ok(CLIENT_LOGOS.length > 0)
  for (const logo of CLIENT_LOGOS) {
    assert.ok(logo.name, `${logo.file} needs the organisation's name`)
    assert.ok(existsSync(new URL(`../../public/assets/logos/clients/${logo.file}.svg`, import.meta.url)), `${logo.name} is missing its file`)
    assert.ok(logo.w > 0 && logo.h > 0, `${logo.name} needs its size`)
    assert.match(logo.source, /^https:\/\//, `${logo.name} needs its source page`)
  }
})

test('no organisation is listed twice', () => {
  for (const key of ['name', 'file']) {
    assert.equal(new Set(CLIENT_LOGOS.map((logo) => logo[key])).size, CLIENT_LOGOS.length)
  }
})
