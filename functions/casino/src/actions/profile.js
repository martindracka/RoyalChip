// Creating a profile, renaming and refilling. Players have no write access to "profiles",
// so the starting balance and the invite bonus can only be set here.
import {
  STARTING_BALANCE,
  FRIEND_BONUS,
  REFILL_THRESHOLD,
  USERNAME_MAX,
  validateUsername,
  isValidReferralCode
} from '../../../../shared/rules.js'
import { randomInt } from '../../../../shared/games/rng.js'
import { badRequest, conflict } from '../errors.js'
import { PROFILES, getProfileOrFail } from './wallet.js'

// Turns any account name into an allowed username, e.g. "Ján <script>" -> "Jn script".
export function cleanUsername(name) {
  const cleaned = String(name || '')
    .replace(/[^a-zA-Z0-9_. -]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, USERNAME_MAX)
  return validateUsername(cleaned) ? 'Player' : cleaned
}

async function isUsernameTaken(db, username, ownId) {
  const row = await db.findOne(PROFILES, 'username', username)
  return Boolean(row && row.$id !== ownId)
}

async function uniqueUsername(db, base, ownId) {
  if (!(await isUsernameTaken(db, base, ownId))) return base
  for (let i = 0; i < 5; i++) {
    const candidate = `${base.slice(0, USERNAME_MAX - 5)}-${1000 + randomInt(9000)}`
    if (!(await isUsernameTaken(db, candidate, ownId))) return candidate
  }
  throw conflict('Could not find a free username. Please try again.')
}

// Accept only a code that belongs to ANOTHER existing player.
async function checkReferrer(db, code, ownId) {
  if (!isValidReferralCode(code) || code === ownId) return null
  return (await db.get(PROFILES, code)) ? code : null
}

export async function initProfile(db, userId, { referralCode } = {}, user) {
  const existing = await db.get(PROFILES, userId)
  if (existing) return { profile: existing }

  const referredBy = await checkReferrer(db, referralCode, userId)
  const data = {
    username: await uniqueUsername(db, cleanUsername(user?.name), userId),
    balance: STARTING_BALANCE + (referredBy ? FRIEND_BONUS : 0),
    totalWagered: 0,
    totalWon: 0,
    gamesPlayed: 0,
    referredBy
  }
  try {
    // Row ID = user ID, so every account can have exactly one profile.
    return { profile: await db.create(PROFILES, userId, data, {}) }
  } catch (error) {
    if (error.code === 409) return { profile: await db.get(PROFILES, userId) } // created by a parallel request
    throw error
  }
}

export async function renameProfile(db, userId, { username } = {}) {
  const error = validateUsername(username)
  if (error) throw badRequest(error)
  const name = username.trim()
  await getProfileOrFail(db, userId)
  if (await isUsernameTaken(db, name, userId)) throw conflict('This username is already taken.')
  return { profile: await db.update(PROFILES, userId, { username: name }) }
}

export async function refillBalance(db, userId) {
  const profile = await getProfileOrFail(db, userId)
  if (profile.balance >= REFILL_THRESHOLD) {
    throw badRequest(`You can refill only when you have less than ${REFILL_THRESHOLD} chips.`)
  }
  return { profile: await db.update(PROFILES, userId, { balance: STARTING_BALANCE }) }
}
