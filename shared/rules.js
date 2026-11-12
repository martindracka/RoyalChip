// Business rules shared by the Vue app (for display) and the Appwrite Function (for enforcement).
// The server is the only place where these numbers are actually applied to a balance.

export const STARTING_BALANCE = 1000 // chips for a new player
export const REFILL_THRESHOLD = 10 // a player may refill only when the balance is below this
export const FRIEND_BONUS = 250 // extra chips for a player who joins through an invite link
export const REFERRAL_REWARD = 250 // chips the inviter gets per qualified friend
export const WAGER_TARGET = 500 // chips the friend has to wager before the inviter is rewarded
export const MAX_REFERRAL_REWARDS = 20 // cap per inviter – limits farming with fake accounts

export const USERNAME_MIN = 3
export const USERNAME_MAX = 20
const USERNAME_PATTERN = /^[a-zA-Z0-9_. -]+$/

// Returns an error message, or '' when the username is fine.
export function validateUsername(value) {
  if (typeof value !== 'string') return 'Username is required'
  const name = value.trim()
  if (name.length < USERNAME_MIN) return `Username must have at least ${USERNAME_MIN} characters`
  if (name.length > USERNAME_MAX) return `Username can have at most ${USERNAME_MAX} characters`
  if (!USERNAME_PATTERN.test(name)) return 'Use only letters, numbers, spaces, dots, dashes and underscores'
  return ''
}

// A referral code is an Appwrite user ID: max 36 chars, a-z, A-Z, 0-9, period, hyphen, underscore.
export function isValidReferralCode(code) {
  return typeof code === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/.test(code)
}

// Same check for any row ID sent by the browser.
export const isValidId = isValidReferralCode

// Returns an error message, or '' when the stake is allowed.
export function validateStake(amount, game, balance) {
  const value = Number(amount)
  if (!game) return 'Game not loaded'
  if (!Number.isInteger(value) || value <= 0) return 'Bet must be a whole number of chips'
  if (value < game.minBet) return `Minimum bet is ${game.minBet}`
  if (value > game.maxBet) return `Maximum bet is ${game.maxBet}`
  if (value > balance) return 'Not enough chips'
  return ''
}
