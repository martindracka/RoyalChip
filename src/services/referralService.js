import { ID, Query, Permission, Role } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { REFERRAL_REWARD } from '@/lib/referral'
import { listRows, createRow } from './db'

const T = TABLES.referralRewards

// Works like promotion claims: the table has a UNIQUE index on referredId,
// so the database refuses a second reward for the same friend (error 409).
export function createReferralReward(userId, friend) {
  const data = { userId, referredId: friend.$id, referredName: friend.username, amount: REFERRAL_REWARD }
  return createRow(T, ID.unique(), data, [Permission.read(Role.user(userId))])
}

export async function listMyRewardedIds(userId) {
  const { rows } = await listRows(T, [Query.equal('userId', userId), Query.limit(100)])
  return rows.map((r) => r.referredId)
}
