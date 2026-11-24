import type { Endpoint } from 'payload'

import { escapeHtml, singleLine } from '../lib/security.js'
import { cap, emailOk, enforceRateLimit, FUTURE_PROOF_REPLY_TO, json, mailto, notify, notifyEmails, readBody, row, table, TOO_MANY } from './shared'

const TRACKS: Record<string, string> = { talk: 'Ready to talk', learn: 'Want to learn first', demo: 'Ready for a demo' }

// POST /api/contact — the contact form, and the Future-Proof gated landing page
// (which sends `source` and the `asset` the visitor asked for).
export const contactEndpoint: Endpoint = {
  path: '/contact',
  method: 'post',
  handler: async (req) => {
    const b = await readBody(req)
    // Honeypot: a real visitor never fills this hidden field. Pretend success, store nothing.
    if (b._hp) return json({ success: true })

    const name = cap(b.name, 200)
    const email = cap(b.email, 320)
    if (!name || !emailOk(email)) return json({ error: 'Name and valid email are required.' }, 400)
    if (await enforceRateLimit(req)) return json(TOO_MANY, 429)

    const company = cap(b.company, 200)
    const role = cap(b.role, 200)
    const interest = cap(b.interest, 200)
    const message = cap(b.message, 5000)
    const track = cap(b.track, 50)
    const asset = cap(b.asset, 50)
    const isLead = b.source === 'future-proof-landing'

    await req.payload.create({
      collection: 'leads',
      data: {
        type: isLead ? 'future-proof' : 'contact',
        name,
        email,
        company,
        data: { name, email, company, role, interest, message, track, asset, source: isLead ? 'future-proof-landing' : '' },
      },
      overrideAccess: true,
    })

    const assetLabel = asset === 'html' ? 'Viewed the HTML article' : asset === 'pdf' ? 'Downloaded the PDF' : asset
    const rows: string[] = []
    if (isLead) {
      rows.push(row('Source', 'Future-Proof landing page'))
      if (asset) rows.push(row('Asset', escapeHtml(assetLabel)))
    } else if (track) {
      rows.push(row('Track', escapeHtml(TRACKS[track] || track)))
    }
    rows.push(row('Name', escapeHtml(name)), row('Email', mailto(email)))
    if (company) rows.push(row('Company', escapeHtml(company)))
    if (role) rows.push(row('Role', escapeHtml(role)))
    if (interest) rows.push(row('Interest', escapeHtml(interest)))
    if (message) rows.push(row('Message', escapeHtml(message)))

    await notify(req, {
      to: notifyEmails(email),
      replyTo: isLead ? FUTURE_PROOF_REPLY_TO : email,
      subject: isLead
        ? `New Future-Proof lead: ${singleLine(name)}${asset ? ` (${singleLine(asset)})` : ''}`
        : `New Proxa Labs inquiry from ${singleLine(name)}`,
      html: table(isLead ? 'New Future-Proof Lead' : 'New Proxa Labs Inquiry', rows),
    })

    return json({ success: true })
  },
}
