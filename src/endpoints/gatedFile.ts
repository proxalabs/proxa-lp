import { createReadStream, existsSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import type { Endpoint } from 'payload'

import { verifyToken } from '../lib/security.js'

// GET /api/gated-file?token=… — serves a gated file for a valid, unexpired link
// handed out by /api/submit-form. The files collection itself is not public.
export const gatedFileEndpoint: Endpoint = {
  path: '/gated-file',
  method: 'get',
  handler: async (req) => {
    const { payload } = req
    const token = new URL(req.url || '', 'http://localhost').searchParams.get('token')
    const claim = verifyToken(token, payload.secret) as { file?: number } | null
    if (!claim?.file) return new Response('This download link is invalid or has expired.', { status: 403 })

    const file = await payload.findByID({ collection: 'files', id: claim.file, overrideAccess: true, disableErrors: true })
    const staticDir = path.resolve(payload.collections.files.config.upload.staticDir || 'files')
    const filePath = file?.filename ? path.resolve(staticDir, file.filename) : ''
    // The filename comes from our own database, but never serve outside the folder.
    if (!file || !filePath.startsWith(staticDir + path.sep) || !existsSync(filePath)) {
      return new Response('File not found.', { status: 404 })
    }

    return new Response(Readable.toWeb(createReadStream(filePath)) as ReadableStream, {
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${String(file.filename).replace(/[^\w.\- ]/g, '_')}"`,
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex',
      },
    })
  },
}
