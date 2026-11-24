import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'
import { getSafeRedirect } from 'payload/shared'

// Opened by the CMS's Preview and Live Preview buttons. Turns on draft mode for a
// signed-in editor, so the site shows unpublished changes to them and nobody else.
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  const secret = searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }
  // Only ever redirect to a path on this site.
  const safePath = path ? getSafeRedirect({ fallbackTo: '', redirectTo: path }) : ''
  if (!safePath) return new Response('A page path is required', { status: 400 })

  const payload = await getPayload({ config: configPromise })
  const draft = await draftMode()
  let user = null
  try {
    user = (await payload.auth({ req: req as unknown as PayloadRequest, headers: req.headers })).user
  } catch (err) {
    payload.logger.error({ err }, 'could not verify the editor for preview')
  }
  if (!user) {
    draft.disable()
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  draft.enable()
  redirect(safePath)
}
