import type { Block } from 'payload'

// Blocks an editor can drop into an article body.

export const TakeawaysBlock: Block = {
  slug: 'takeaways',
  labels: { singular: 'Key takeaways', plural: 'Key takeaways' },
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Takeaway', plural: 'Takeaways' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
  ],
}

// Emits FAQPage structured data, so AI answers and search can quote it.
export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Question', plural: 'Questions' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}
