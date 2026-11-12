// One-shot games: slots, roulette, dice and coin flip.
// The browser only sends its CHOICES. The result is decided here with a secure random generator.
import { spinReels, slotsMultiplier } from '../../../../shared/games/slots.js'
import { BET_TYPES, spinWheel, rouletteMultiplier, numberColor } from '../../../../shared/games/roulette.js'
import { rollDice, diceMultiplier, diceWins } from '../../../../shared/games/dice.js'
import { flipCoin, COINFLIP_MULTIPLIER } from '../../../../shared/games/coinflip.js'
import { calcPayout } from '../../../../shared/games/payout.js'
import { validateStake, isValidId } from '../../../../shared/rules.js'
import { badRequest, notFound } from '../errors.js'
import { getProfileOrFail, chargeStake, settleRound } from './wallet.js'

// Loads a game the player is allowed to bet on and checks the stake against ITS limits.
export async function loadGameForBet(db, userId, { gameId, amount }, expectedType) {
  if (!isValidId(gameId)) throw badRequest('Invalid game')
  const game = await db.get('games', gameId)
  if (!game || game.isActive === false) throw notFound('This game is not available.')
  if (expectedType && game.type !== expectedType) throw badRequest('Wrong game type')
  const profile = await getProfileOrFail(db, userId)
  const stakeError = validateStake(amount, game, profile.balance)
  if (stakeError) throw badRequest(stakeError)
  return { game, profile, stake: Number(amount) }
}

const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max

// Each resolver validates the player's choices and returns { result, multiplier, outcome }.
const RESOLVERS = {
  slots() {
    const reels = spinReels()
    return { result: { reels }, multiplier: slotsMultiplier(reels), outcome: reels.join(' ') }
  },

  roulette({ betType, pick }) {
    if (!Object.hasOwn(BET_TYPES, betType)) throw badRequest('Unknown bet type')
    if (betType === 'straight' && !isInt(pick, 0, 36)) throw badRequest('Pick a number from 0 to 36')
    const number = spinWheel()
    const label = betType === 'straight' ? `number ${pick}` : BET_TYPES[betType].label
    return {
      result: { number },
      multiplier: rouletteMultiplier(betType, number, betType === 'straight' ? pick : null),
      outcome: `Ball on ${number} (${numberColor(number)}) – bet on ${label}`
    }
  },

  dice({ target, direction }) {
    if (!isInt(target, 2, 98)) throw badRequest('Target must be between 2 and 98')
    if (direction !== 'over' && direction !== 'under') throw badRequest('Choose over or under')
    const roll = rollDice()
    const won = diceWins(roll, target, direction)
    return {
      result: { roll, won },
      multiplier: won ? diceMultiplier(target, direction) : 0,
      outcome: `Rolled ${roll} – needed ${direction} ${target}`
    }
  },

  coinflip({ choice }) {
    if (choice !== 'heads' && choice !== 'tails') throw badRequest('Pick heads or tails')
    const side = flipCoin()
    return {
      result: { side },
      multiplier: side === choice ? COINFLIP_MULTIPLIER : 0,
      outcome: `Coin landed on ${side} – you picked ${choice}`
    }
  }
}

export async function playGame(db, userId, payload) {
  const { game, profile, stake } = await loadGameForBet(db, userId, payload)
  if (!Object.hasOwn(RESOLVERS, game.type)) throw badRequest('This game has its own actions') // blackjack
  const resolve = RESOLVERS[game.type]

  // 1. validate the choices, 2. take the stake, 3. decide the result, 4. pay out
  const round = resolve(payload)
  await chargeStake(db, userId, stake)
  const payout = calcPayout(stake, round.multiplier)
  const updated = await settleRound(db, { userId, profile, game, stake, payout, outcome: round.outcome })
  return { ...round.result, stake, payout, outcome: round.outcome, profile: updated }
}
