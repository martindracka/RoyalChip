// Rules of the "Invite friends" programme – plain functions, so they are easy to unit test.

import { WAGER_TARGET } from '@shared/rules.js'

// The amounts live in shared/rules.js – the casino Function applies them on the server.
export { REFERRAL_REWARD, FRIEND_BONUS, WAGER_TARGET, isValidReferralCode } from '@shared/rules.js'

// How far a friend is towards the wager target.
export function referralProgress(totalWagered = 0, target = WAGER_TARGET) {
  const wagered = Math.max(0, totalWagered || 0)
  return {
    wagered,
    percent: Math.min(100, Math.floor((wagered / target) * 100)),
    remaining: Math.max(0, target - wagered),
    ready: wagered >= target
  }
}

export function buildReferralLink(origin, userId) {
  return `${origin}/register?ref=${encodeURIComponent(userId)}`
}

