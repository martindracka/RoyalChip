import { ID, Query, Permission, Role } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows, createRow } from './db'

const T = TABLES.claims

// The table has a UNIQUE index on (userId, promotionId),
// so the database itself refuses a second claim of the same promotion (error 409).
export function createClaim(userId, promotion) {
  const data = { userId, promotionId: promotion.$id, amount: promotion.bonusAmount }
  return createRow(T, ID.unique(), data, [Permission.read(Role.user(userId))])
}

export async function listMyClaimedIds(userId) {
  const { rows } = await listRows(T, [Query.equal('userId', userId), Query.limit(100)])
  return rows.map((c) => c.promotionId)
}
