// Promotion bonuses and invite-friend rewards. The amounts always come from the database or
// the shared rules – never from the request – and unique indexes stop double claims.
import { REFERRAL_REWARD, WAGER_TARGET, MAX_REFERRAL_REWARDS, isValidId } from '../../../../shared/rules.js'
import { badRequest, conflict, forbidden, notFound } from '../errors.js'
import { PROFILES, addChips, getProfileOrFail } from './wallet.js'

export function isPromotionRunning(promotion, now = new Date()) {
  if (!promotion || promotion.isActive === false) return false
  return new Date(promotion.startsAt) <= now && now <= new Date(promotion.endsAt)
}

export async function claimPromotion(db, userId, { promotionId } = {}) {
  if (!isValidId(promotionId)) throw badRequest('Invalid promotion')
  const promotion = await db.get('promotions', promotionId)
  if (!promotion) throw notFound('This promotion does not exist.')
  if (!isPromotionRunning(promotion)) throw badRequest('This promotion is not running right now.')
  await getProfileOrFail(db, userId)

  try {
    // UNIQUE index (userId, promotionId): a second claim fails in the database itself,
    // even if two requests arrive at the same millisecond.
    await db.create('claims', null, { userId, promotionId, amount: promotion.bonusAmount }, { readableBy: userId })
  } catch (error) {
    if (error.code === 409) throw conflict('You have already claimed this promotion.')
    throw error
  }
  await addChips(db, userId, promotion.bonusAmount)
  return { amount: promotion.bonusAmount, profile: await db.get(PROFILES, userId) }
}

export async function claimReferral(db, userId, { friendId } = {}) {
  if (!isValidId(friendId)) throw badRequest('Invalid friend')
  const friend = await db.get(PROFILES, friendId)
  // The friend must really have joined through MY link.
  if (!friend || friend.referredBy !== userId) throw forbidden('This player did not join through your invite link.')
  if ((friend.totalWagered || 0) < WAGER_TARGET) throw badRequest('Your friend has not wagered enough chips yet.')
  await getProfileOrFail(db, userId)
  if ((await db.count('referralRewards', 'userId', userId)) >= MAX_REFERRAL_REWARDS) {
    throw badRequest(`You have reached the limit of ${MAX_REFERRAL_REWARDS} invite rewards.`)
  }

  try {
    // UNIQUE index on referredId: every friend can be rewarded only once.
    await db.create(
      'referralRewards',
      null,
      { userId, referredId: friend.$id, referredName: friend.username, amount: REFERRAL_REWARD },
      { readableBy: userId }
    )
  } catch (error) {
    if (error.code === 409) throw conflict('You already got the reward for this friend.')
    throw error
  }
  await addChips(db, userId, REFERRAL_REWARD)
  return { amount: REFERRAL_REWARD, profile: await db.get(PROFILES, userId) }
}
