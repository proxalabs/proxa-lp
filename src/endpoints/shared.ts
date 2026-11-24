import type { PayloadRequest } from 'payload'

import { clientIp, escapeHtml, isOverLimit, nextWindow } from '../lib/security.js'

// Shared plumbing for the public form endpoints (which replace the Cloud Functions).

// NOTIFY_EMAIL is authoritative in production; these are only the fallbacks the
// site has always used when the variable is unset.
const DEFAULT_NOTIFY_EMAILS = 'sales@insitehub.com,john.royer@insitehub.com,mehrler@proxalabs.com'
export const FUTURE_PROOF_REPLY_TO = 'mehrler@proxalabs.com'
// Innovation Collective registrations go to Mercy (both addresses).
const DEFAULT_EVENT_NOTIFY = 'mehrler@proxalabs.com,mercy@ehrlermarketingadvisory.com'

export const json = (data: unknown, status = 200) => Response.json(data, { status })

export const parseEmails = (value: string | null | undefined): string[] =>
  (value || '').split(',').map((e) => e.trim()).filter(Boolean)

/** Team recipients, minus the submitter so nobody is notified of their own inquiry. */
export function notifyEmails(submitterEmail?: string): string[] {
  const submitter = (submitterEmail || '').trim().toLowerCase()
  return parseEmails(process.env.NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAILS).filter((e) => e.toLowerCase() !== submitter)
}

export const eventNotifyEmails = () => parseEmails(process.env.EVENT_NOTIFY_EMAIL || DEFAULT_EVENT_NOTIFY)

/** The JSON body of a request, or an empty object when it is missing or invalid. */
export async function readBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    const body = await req.json?.()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

export const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

/** Trim and cap a submitted value, so a huge field cannot bloat storage or an email. */
export const cap = (v: unknown, max: number) => String(v == null ? '' : v).trim().slice(0, max)

/**
 * Per-address + global rate limit shared by every public form endpoint, so none
 * can be used as an open email relay. Returns true when the caller is over it.
 */
export async function enforceRateLimit(req: PayloadRequest, now = Date.now()): Promise<boolean> {
  const { payload } = req
  const keys = [`ip:${clientIp(req.headers)}`, 'global']
  const { docs } = await payload.find({ collection: 'rate-limits', where: { key: { in: keys } }, limit: 2, pagination: false, overrideAccess: true })
  const current = (key: string) => docs.find((d) => d.key === key)
  const next = keys.map((key) => ({ key, doc: current(key), state: nextWindow(current(key), now) }))
  if (isOverLimit(next[0].state, next[1].state)) return true
  await Promise.all(
    next.map(({ key, doc, state }) =>
      doc
        ? payload.update({ collection: 'rate-limits', id: doc.id, data: state, overrideAccess: true })
        : payload.create({ collection: 'rate-limits', data: { key, ...state }, overrideAccess: true }),
    ),
  )
  return false
}

type Mail = { to: string[]; replyTo?: string; subject: string; html: string }

/**
 * Send a notification, best-effort. The submission is always stored before this
 * runs, so a mail failure is logged and never fails the visitor's request.
 */
export async function notify(req: PayloadRequest, mail: Mail): Promise<void> {
  if (!mail.to.length) return
  try {
    await req.payload.sendEmail({ to: mail.to, replyTo: mail.replyTo, subject: mail.subject, html: mail.html })
  } catch (err) {
    req.payload.logger.error({ err }, `notification email failed: ${mail.subject}`)
  }
}

/** One row of a notification-email table. `value` must already be safe HTML. */
export const row = (label: string, value: string) =>
  `<tr><td style="padding:8px 16px 8px 0;font-weight:bold;color:#666;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;">${value}</td></tr>`

export const table = (heading: string, rows: string[], note = '') =>
  `<h2>${escapeHtml(heading)}</h2>${note}<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">${rows.join('')}</table>`

export const mailto = (email: string) => `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`

export const TOO_MANY = { error: 'Too many submissions. Please try again later.' }
