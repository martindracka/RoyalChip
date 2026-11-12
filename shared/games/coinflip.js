import { randomInt } from './rng.js'

export const COINFLIP_MULTIPLIER = 1.96

export function flipCoin(rand = randomInt) {
  return rand(2) === 0 ? 'heads' : 'tails'
}
