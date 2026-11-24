import type { Endpoint } from 'payload'

import { escapeHtml, singleLine } from '../lib/security.js'
import { cap, emailOk, enforceRateLimit, json, notify, notifyEmails, readBody, row, table, TOO_MANY } from './shared'

// POST /api/newsletter — newsletter sign-up.
export const newsletterEndpoint: Endpoint = {
  path: '/newsletter',
  method: 'post',
  handler: async (req) => {
    const b = await readBody(req)
    if (b._hp) return json({ success: true })

    const email = cap(b.email, 320)
    if (!emailOk(email)) return json({ error: 'Valid email is required.' }, 400)
    if (await enforceRateLimit(req)) return json(TOO_MANY, 429)

    const name = cap(b.name, 200)
    const role = cap(b.role, 200)
    const interests = Array.isArray(b.interests) ? b.interests.slice(0, 20).map((i) => cap(i, 100)).filter(Boolean) : []

    await req.payload.create({
      collection: 'leads',
      data: { type: 'newsletter', name, email, data: { email, name, role, interests } },
      overrideAccess: true,
    })

    const rows = [row('Email', escapeHtml(email))]
    if (name) rows.push(row('Name', escapeHtml(name)))
    if (role) rows.push(row('Role', escapeHtml(role)))
    if (interests.length) rows.push(row('Interests', escapeHtml(interests.join(', '))))

    await notify(req, {
      to: notifyEmails(email),
      replyTo: email,
      subject: name ? `New newsletter subscriber: ${singleLine(name)} <${singleLine(email)}>` : `New newsletter subscriber: ${singleLine(email)}`,
      html: table('New Newsletter Subscriber', rows),
    })

    return json({ success: true })
  },
}
