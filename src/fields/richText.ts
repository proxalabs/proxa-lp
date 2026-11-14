import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

import { FaqBlock, TakeawaysBlock } from '../blocks/article'

// Only what the site's renderer supports (see src/lib/lexical.js): paragraphs,
// h2-h4, bold/italic/underline, links, lists, quotes, images and two blocks.
const UNSUPPORTED = new Set([
  'heading', 'upload', 'relationship', 'checklist', 'indent', 'align',
  'subscript', 'superscript', 'strikethrough', 'inlineCode', 'horizontalRule',
])

/** The article body editor. */
export const articleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !UNSUPPORTED.has(f.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    UploadFeature({
      collections: { media: { fields: [{ name: 'caption', type: 'text', label: 'Caption (optional)' }] } },
    }),
    BlocksFeature({ blocks: [TakeawaysBlock, FaqBlock] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

/** Formatted copy without headings, images or blocks (summaries, section text). */
export const simpleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !UNSUPPORTED.has(f.key) && f.key !== 'blockquote'),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
