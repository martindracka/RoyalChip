// Rules of the "Invite friends" programme – plain functions, so they are easy to unit test.

export const REFERRAL_REWARD = 250 // chips the inviter gets per qualified friend
export const FRIEND_BONUS = 250 // extra chips for a friend who joins through a link
export const WAGER_TARGET = 500 // chips the friend has to wager before the inviter is rewarded

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

// A referral code is an Appwrite user ID: max 36 chars, a-z, A-Z, 0-9, period, hyphen, underscore.
export function isValidReferralCode(code) {
  return typeof code === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/.test(code)
}
