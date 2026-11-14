import type { Endpoint } from 'payload'

import { escapeHtml, singleLine } from '../lib/security.js'
import { cap, emailOk, enforceRateLimit, eventNotifyEmails, json, mailto, notify, readBody, row, table, TOO_MANY } from './shared'

// POST /api/event-register — Innovation Collective: private, invite-only. Each
// registration is stored first (a seat is never lost if email hiccups), then
// emailed for manual review. Nobody is auto-confirmed.
export const eventRegisterEndpoint: Endpoint = {
  path: '/event-register',
  method: 'post',
  handler: async (req) => {
    const b = await readBody(req)
    if (b._hp) return json({ success: true })

    const fullName = cap(b.fullName, 200)
    const title = cap(b.title, 200)
    const company = cap(b.company, 200)
    const email = cap(b.email, 320)
    const inviter = cap(b.inviter, 200)
    const challenge = cap(b.challenge, 5000)
    const plusOne = b.plusOne === 'yes' ? 'yes' : b.plusOne === 'no' ? 'no' : ''
    const colleagueName = plusOne === 'yes' ? cap(b.colleagueName, 200) : ''
    const colleagueEmail = plusOne === 'yes' ? cap(b.colleagueEmail, 320) : ''
    const onsite = Boolean(b.onsite)

    if (!fullName || !title || !company || !emailOk(email) || !inviter || !challenge || !plusOne) {
      return json({ error: 'Please complete all required fields.' }, 400)
    }
    if (plusOne === 'yes' && (!colleagueName || !emailOk(colleagueEmail))) {
      return json({ error: "Please complete your colleague's details." }, 400)
    }
    if (await enforceRateLimit(req)) return json(TOO_MANY, 429)

    try {
      await req.payload.create({
        collection: 'leads',
        data: {
          type: 'event-registration',
          name: fullName,
          email,
          company,
          data: { fullName, title, company, email, inviter, challenge, plusOne, colleagueName, colleagueEmail, onsite },
        },
        overrideAccess: true,
      })
    } catch (err) {
      // If storing fails, say so, so the visitor retries rather than being silently dropped.
      req.payload.logger.error({ err }, 'event registration store failed')
      return json({ error: 'Submission failed — please try again.' }, 500)
    }

    const rows = [
      row('Name', escapeHtml(fullName)),
      row('Title', escapeHtml(title)),
      row('Company', escapeHtml(company)),
      row('Email', mailto(email)),
      row('Invited by', escapeHtml(inviter)),
      row('Biggest AI challenge', escapeHtml(challenge)),
      row('Bringing a colleague', plusOne === 'yes' ? 'Yes' : 'No'),
    ]
    if (plusOne === 'yes') rows.push(row('Colleague', escapeHtml(colleagueName)), row('Colleague email', mailto(colleagueEmail)))
    rows.push(row('On-site session requested', onsite ? 'Yes' : 'No'))

    await notify(req, {
      to: eventNotifyEmails(),
      replyTo: email,
      subject: `New Innovation Collective registration: ${singleLine(fullName)} (${singleLine(company)})`,
      html: table(
        'New Innovation Collective registration',
        rows,
        '<p style="font-family:sans-serif;font-size:13px;color:#888;">Review and confirm this seat personally — nobody is auto-confirmed.</p>',
      ),
    })

    return json({ success: true })
  },
}
