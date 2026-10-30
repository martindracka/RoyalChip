// Roles are stored as Appwrite user *labels* (set server-side with scripts/set-role.js).
// The same labels are used in the database permissions, so the backend enforces them too.
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  PLAYER: 'player',
  GUEST: 'guest'
}

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.EDITOR]

export function getRole(user) {
  if (!user) return ROLES.GUEST
  const labels = user.labels || []
  if (labels.includes(ROLES.ADMIN)) return ROLES.ADMIN
  if (labels.includes(ROLES.EDITOR)) return ROLES.EDITOR
  return ROLES.PLAYER
}

// What each role may do in the UI. The database permissions mirror this table
// (see scripts/schema.js) so hiding a button is never the only protection.
const PERMISSIONS = {
  [ROLES.ADMIN]: ['play', 'manage:content', 'delete:content', 'manage:players', 'view:bets'],
  [ROLES.EDITOR]: ['play', 'manage:content'],
  [ROLES.PLAYER]: ['play'],
  [ROLES.GUEST]: []
}

export function can(role, action) {
  return (PERMISSIONS[role] || []).includes(action)
}
