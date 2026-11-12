import { randomInt } from './rng.js'

export const HOUSE_EDGE = 0.01

export function rollDice(rand = randomInt) {
  return rand(100) + 1
}

// Chance (in %) of winning: "over 70" wins on 71–100 = 30 %
export function winChance(target, direction) {
  return direction === 'over' ? 100 - target : target - 1
}

export function diceMultiplier(target, direction) {
  const chance = winChance(target, direction)
  if (chance <= 0) return 0
  return Math.floor(((100 * (1 - HOUSE_EDGE)) / chance) * 100) / 100
}

export function diceWins(roll, target, direction) {
  return direction === 'over' ? roll > target : roll < target
}
