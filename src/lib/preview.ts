/** Address the CMS opens to preview a path on the site with unpublished changes. */
export function previewPath(path: string | null | undefined): string | null {
  if (!path) return null
  const params = new URLSearchParams({ path, previewSecret: process.env.PREVIEW_SECRET || '' })
  return `/next/preview?${params.toString()}`
}
