import { cache } from 'react'

import { lexicalToText } from '@/lib/lexical'
import type { Form } from '@/payload-types'

import { getPayloadClient, readOptions } from './payload'

// The public form definition: what the browser needs to render the form, and
// nothing else. The notification address and the gated file never leave the server.
export type PublicForm = {
  slug: string
  name: string
  title: string
  intro: string
  fields: { key: string; label: string; type: string; required: boolean; options?: string[] }[]
  consentText: string
  successMessage: string
  gatedFileLabel: string
  submitText: string
}

type FormField = NonNullable<Form['fields']>[number]

const INPUT_TYPE: Record<string, string> = { text: 'text', email: 'email', textarea: 'textarea', select: 'select', checkbox: 'checkbox', number: 'text' }

/** The input fields of a form (static "message" blocks are not inputs). */
export function inputFields(form: Pick<Form, 'fields'>) {
  return (form.fields || []).filter((f): f is Exclude<FormField, { blockType: 'message' }> => f.blockType !== 'message' && 'name' in f)
}

export function toPublicForm(form: Form): PublicForm {
  return {
    slug: form.slug,
    name: form.title,
    title: form.title,
    intro: form.intro || '',
    fields: inputFields(form).map((f) => ({
      key: f.name,
      label: f.label || f.name,
      // A text field named like a phone number gets the phone keyboard on mobile.
      type: f.blockType === 'text' && /phone|tel/i.test(f.name) ? 'tel' : INPUT_TYPE[f.blockType] || 'text',
      required: Boolean(f.required),
      ...(f.blockType === 'select' ? { options: (f.options || []).map((o) => o.label) } : {}),
    })),
    consentText: form.consentText || '',
    successMessage: form.confirmationType === 'message' ? lexicalToText(form.confirmationMessage) : '',
    gatedFileLabel: form.gatedFileLabel || '',
    submitText: form.submitButtonLabel || '',
  }
}

/** A published form by its address, as the public definition. */
export const getPublicForm = cache(async (slug: string): Promise<PublicForm | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'forms',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    pagination: false,
    ...(await readOptions()),
  })
  return docs[0] ? toPublicForm(docs[0]) : null
})
