// Every change of a balance goes through these helpers.
import { badRequest } from '../errors.js'

export const PROFILES = 'profiles'
export const BETS = 'bets'

export async function getProfileOrFail(db, userId) {
  const profile = await db.get(PROFILES, userId)
  if (!profile) throw badRequest('Your player profile does not exist yet. Reload the page.')
  return profile
}

// Takes the stake ATOMICALLY: the database lowers the balance only if it stays >= 0.
// Two bets sent at the same moment can therefore never spend the same chips twice.
export async function chargeStake(db, userId, amount) {
  try {
    await db.decrement(PROFILES, userId, 'balance', amount, 0)
  } catch {
    throw badRequest('Not enough chips')
  }
}

export async function addChips(db, userId, amount) {
  if (amount > 0) await db.increment(PROFILES, userId, 'balance', amount)
}

// Pays out a finished round, updates the statistics and stores an immutable bet record.
export async function settleRound(db, { userId, profile, game, stake, payout, outcome }) {
  await addChips(db, userId, payout)
  await db.increment(PROFILES, userId, 'totalWagered', stake)
  if (payout > 0) await db.increment(PROFILES, userId, 'totalWon', payout)
  await db.increment(PROFILES, userId, 'gamesPlayed', 1)

  // Only the owner may read the bet. Nobody gets update permission -> history can't be edited.
  await db.create(
    BETS,
    null,
    {
      userId,
      username: profile.username,
      gameId: game.$id,
      gameName: game.name,
      gameType: game.type,
      amount: stake,
      payout,
      outcome: outcome.slice(0, 255)
    },
    { readableBy: userId }
  )
  return db.get(PROFILES, userId)
}
