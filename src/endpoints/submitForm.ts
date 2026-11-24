import type { Endpoint } from 'payload'

import { inputFields } from '../lib/data/forms'
import { escapeHtml, signToken, singleLine } from '../lib/security.js'
import { cap, enforceRateLimit, json, notify, notifyEmails, parseEmails, readBody, row, table, TOO_MANY } from './shared'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid']
export const GATED_LINK_TTL_MS = 15 * 60 * 1000

// POST /api/submit-form — a form built in the CMS. Validates against the form's own
// definition, stores the submission, emails a notification, and returns a
// short-lived download link when the form gates a file.
export const submitFormEndpoint: Endpoint = {
  path: '/submit-form',
  method: 'post',
  handler: async (req) => {
    const { payload } = req
    const b = await readBody(req)
    if (b._hp) return json({ success: true })

    const formSlug = cap(b.formSlug, 200)
    if (!formSlug) return json({ error: 'Missing form.' }, 400)

    const { docs } = await payload.find({
      collection: 'forms',
      where: { and: [{ slug: { equals: formSlug } }, { _status: { equals: 'published' } }] },
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true, // needs the server-only fields: notifyEmail, gatedFile
    })
    const form = docs[0]
    if (!form) return json({ error: 'Form not found.' }, 404)

    // Validate first, so a typo never burns the visitor's rate-limit budget and
    // invalid spam never reaches the counter or the store.
    const fields = inputFields(form)
    const data = b.data && typeof b.data === 'object' ? (b.data as Record<string, unknown>) : {}
    for (const f of fields) {
      if (f.required && !String(data[f.name] == null ? '' : data[f.name]).trim()) {
        return json({ error: `Please fill in "${f.label || f.name}".` }, 400)
      }
    }
    if (form.consentText && !b.consent) return json({ error: 'Please accept to continue.' }, 400)
    if (await enforceRateLimit(req)) return json(TOO_MANY, 429)

    // Keep only the fields the form defines and the known campaign parameters.
    const clean = fields.map((f) => ({ field: f.name, label: f.label || f.name, value: cap(data[f.name], 5000) }))
    const utm: Record<string, string> = {}
    if (b.utm && typeof b.utm === 'object') {
      for (const key of UTM_KEYS) {
        const value = (b.utm as Record<string, unknown>)[key]
        if (value != null) utm[key] = cap(value, 200)
      }
    }

    await payload.create({
      collection: 'form-submissions',
      data: { form: form.id, submissionData: clean.map(({ field, value }) => ({ field, value })), utm, consent: Boolean(b.consent) },
      overrideAccess: true,
    })

    const rows = clean.map((c) => row(c.label, escapeHtml(c.value)))
    for (const [key, value] of Object.entries(utm)) rows.push(row(key, `<span style="color:#999;">${escapeHtml(value)}</span>`))
    const recipients = parseEmails(form.notifyEmail)
    await notify(req, {
      to: recipients.length ? recipients : notifyEmails(),
      subject: `New form submission: ${singleLine(form.title).slice(0, 200)}`,
      html: table(form.title, rows),
    })

    const out: { success: true; download?: string } = { success: true }
    const fileId = form.gatedFile && typeof form.gatedFile === 'object' ? form.gatedFile.id : form.gatedFile
    if (fileId) out.download = `/api/gated-file?token=${encodeURIComponent(signToken({ file: fileId }, payload.secret, GATED_LINK_TTL_MS))}`
    return json(out)
  },
}
