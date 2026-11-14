import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'

import { PHOTOS, SCREENS, imageProps } from './images.js'

const onDisk = (url) => existsSync(new URL(`../../public${url}`, import.meta.url))

for (const [kind, set] of Object.entries({ PHOTOS, SCREENS })) {
  test(`every image in ${kind} has its files, its size and a description`, () => {
    assert.ok(Object.keys(set).length > 0)
    for (const [name, image] of Object.entries(set)) {
      assert.ok(image.alt && image.alt.length > 15, `${name} needs a real description`)
      assert.ok(image.width > 0 && image.height > 0, `${name} needs its pixel size`)
      assert.equal(image.width, Math.max(...image.widths), `${name}: width is the largest file's width`)
      for (const width of image.widths) assert.ok(onDisk(`${image.base}-${width}.webp`), `${name} is missing its ${width}px file`)
    }
  })
}

test('every stock photo records where it came from', () => {
  for (const [name, photo] of Object.entries(PHOTOS)) {
    assert.match(photo.source, /^https:\/\/www\.pexels\.com\/photo\//, `${name} needs its source page`)
  }
})

test('imageProps gives an <img> everything it needs to load the right size without layout shift', () => {
  const props = imageProps(PHOTOS['lab-flasks'], '(max-width: 960px) 100vw, 560px')
  assert.equal(props.src, '/assets/photos/lab-flasks-1600.webp')
  assert.equal(props.srcSet, '/assets/photos/lab-flasks-800.webp 800w, /assets/photos/lab-flasks-1600.webp 1600w')
  assert.equal(props.sizes, '(max-width: 960px) 100vw, 560px')
  assert.equal(props.width, 1600)
  assert.equal(props.height, 1067)
  assert.equal(props.alt, PHOTOS['lab-flasks'].alt)
})
