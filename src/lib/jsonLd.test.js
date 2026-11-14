import assert from 'node:assert/strict'
import { test } from 'node:test'

import { jsonLdString } from './jsonLd.js'

test('jsonLdString cannot close its own script tag', () => {
  const out = jsonLdString({ name: '</script><script>alert(1)</script>' })
  assert.ok(!out.includes('</script>'))
  assert.ok(!out.includes('<'))
})

test('jsonLdString still parses back to the same data', () => {
  const data = { '@type': 'Article', headline: 'A < B & "C"', n: 3 }
  assert.deepEqual(JSON.parse(jsonLdString(data)), data)
})
