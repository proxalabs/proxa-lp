// Turn a source image into the WebP sizes the site serves from public/assets.
//
//   node scripts/optimize-image.mjs <source> <public/assets/.../name> <width> [width…] [--quality=80]
//
// Writes <name>-<width>.webp for each width (never upscaling) and prints the pixel size of
// each, which goes into src/content/images.js so pages can reserve the right space.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const args = process.argv.slice(2)
const quality = Number((args.find((a) => a.startsWith('--quality=')) || '--quality=80').split('=')[1])
const [source, dest, ...widths] = args.filter((a) => !a.startsWith('--'))
if (!source || !dest || widths.length === 0) {
  console.error('usage: node scripts/optimize-image.mjs <source> <dest-without-extension> <width> [width…] [--quality=80]')
  process.exit(2)
}
mkdirSync(dirname(dest), { recursive: true })
for (const width of widths.map(Number)) {
  const info = await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(`${dest}-${width}.webp`)
  console.log(`${dest}-${width}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
}
