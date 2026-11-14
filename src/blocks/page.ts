import type { Block } from 'payload'

import { destinationFields } from '../fields/link'
import { simpleEditor } from '../fields/richText'

// The kit of ready-made sections a landing page is built from. Each block's data
// is turned into props for an existing site component by src/lib/data/pages.ts.

const cta = [{ name: 'ctaLabel', type: 'text' as const, label: 'Button text' }, ...destinationFields('cta', 'Button links to')]

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero banner', plural: 'Hero banners' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow (small label)' },
    { name: 'headline', type: 'text', required: true },
    { name: 'subhead', type: 'textarea', label: 'Subheading' },
    ...cta,
    { name: 'dark', type: 'checkbox', label: 'Dark background', defaultValue: false },
  ],
}

export const SplitBlock: Block = {
  slug: 'split',
  labels: { singular: 'Text + image', plural: 'Text + image' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea', label: 'Body text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'reverse', type: 'checkbox', label: 'Put the image on the left', defaultValue: false },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Formatted text', plural: 'Formatted text' },
  fields: [
    { name: 'heading', type: 'text', label: 'Heading (optional)' },
    { name: 'body', type: 'richText', editor: simpleEditor, label: 'Text' },
  ],
}

export const CardsBlock: Block = {
  slug: 'cards',
  labels: { singular: 'Feature cards', plural: 'Feature cards' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'lead', type: 'textarea', label: 'Intro text' },
    {
      name: 'cards',
      type: 'array',
      labels: { singular: 'Card', plural: 'Cards' },
      fields: [{ name: 'title', type: 'text', required: true }, { name: 'body', type: 'textarea' }],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Stat band', plural: 'Stat bands' },
  fields: [
    {
      name: 'stats',
      type: 'array',
      labels: { singular: 'Stat', plural: 'Stats' },
      fields: [
        { type: 'row', fields: [{ name: 'value', type: 'text', required: true }, { name: 'label', type: 'text' }] },
        { name: 'source', type: 'text' },
      ],
    },
  ],
}

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: { singular: 'Pull quote', plural: 'Pull quotes' },
  fields: [{ name: 'quote', type: 'textarea', required: true }, { name: 'author', type: 'text' }],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [{ name: 'heading', type: 'text', required: true }, { name: 'body', type: 'textarea', label: 'Body text' }, ...cta],
}

// Emits FAQPage structured data for the page.
export const FaqSectionBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Question', plural: 'Questions' },
      fields: [{ name: 'question', type: 'text', required: true }, { name: 'answer', type: 'textarea', required: true }],
    },
  ],
}

export const LogoStripBlock: Block = {
  slug: 'logoStrip',
  labels: { singular: 'Logo strip', plural: 'Logo strips' },
  fields: [
    { name: 'heading', type: 'text', label: 'Heading (e.g. “Trusted by”)' },
    {
      name: 'logos',
      type: 'array',
      labels: { singular: 'Logo', plural: 'Logos' },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }, { name: 'name', type: 'text' }],
    },
  ],
}

export const FormBlock: Block = {
  slug: 'form',
  labels: { singular: 'Form', plural: 'Forms' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'form', type: 'relationship', relationTo: 'forms', required: true, label: 'Which form' },
  ],
}

export const PAGE_BLOCKS: Block[] = [
  HeroBlock, SplitBlock, RichTextBlock, CardsBlock, StatsBlock, QuoteBlock, CtaBlock, FaqSectionBlock, LogoStripBlock, FormBlock,
]
