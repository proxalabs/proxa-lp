import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getSafeRedirect } from 'payload/shared'

// Leaves draft mode and returns to the published page.
export async function GET(req: NextRequest): Promise<Response> {
  const draft = await draftMode()
  draft.disable()
  const back = new URL(req.url).searchParams.get('path')
  redirect(getSafeRedirect({ fallbackTo: '/', redirectTo: back || '/' }) || '/')
}
