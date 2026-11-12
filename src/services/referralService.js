import { Query } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows } from './db'

const T = TABLES.referralRewards

// Rewards are created only by the casino Function after it checked the friend's progress.
export async function listMyRewardedIds(userId) {
  const { rows } = await listRows(T, [Query.equal('userId', userId), Query.limit(100)])
  return rows.map((r) => r.referredId)
}
