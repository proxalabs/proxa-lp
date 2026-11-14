import type { Access, FieldAccess } from 'payload'

type Role = 'admin' | 'editor'
const roleOf = (user: unknown): Role | null =>
  user && typeof user === 'object' && 'role' in user ? ((user as { role?: Role }).role ?? null) : null

export const anyone: Access = () => true

/** Any signed-in CMS user (admin or editor). */
export const isStaff: Access = ({ req: { user } }) => Boolean(user)

/** Admins only: users, navigation, redirects, fixed-page copy. */
export const isAdmin: Access = ({ req: { user } }) => roleOf(user) === 'admin'

export const isAdminField: FieldAccess = ({ req: { user } }) => roleOf(user) === 'admin'

/** Staff see everything; the public sees published documents only. */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
