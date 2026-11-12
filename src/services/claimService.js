import { Query } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows } from './db'

const T = TABLES.claims

// Claims are created only by the casino Function (see functions/casino/src/actions/rewards.js).
// The player can read their own claims thanks to a row-level read permission.
export async function listMyClaimedIds(userId) {
  const { rows } = await listRows(T, [Query.equal('userId', userId), Query.limit(100)])
  return rows.map((c) => c.promotionId)
}
