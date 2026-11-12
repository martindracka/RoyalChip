import { randomInt } from './rng.js'

// icon = symbol id (rendered as an SVG by SlotSymbol.vue)
// weight = how often the symbol appears, multiplier = payout for three in a row
export const SYMBOLS = [
  { icon: 'cherry', weight: 30, multiplier: 5 },
  { icon: 'lemon', weight: 25, multiplier: 8 },
  { icon: 'bell', weight: 18, multiplier: 15 },
  { icon: 'star', weight: 14, multiplier: 25 },
  { icon: 'gem', weight: 9, multiplier: 50 },
  { icon: 'seven', weight: 4, multiplier: 100 }
]

const TOTAL_WEIGHT = SYMBOLS.reduce((sum, s) => sum + s.weight, 0)

export function randomSymbol(rand = randomInt) {
  let roll = rand(TOTAL_WEIGHT)
  for (const symbol of SYMBOLS) {
    if (roll < symbol.weight) return symbol.icon
    roll -= symbol.weight
  }
  return SYMBOLS[0].icon
}

export function spinReels(rand = randomInt) {
  return [randomSymbol(rand), randomSymbol(rand), randomSymbol(rand)]
}

// Returns the payout multiplier for a finished spin.
export function slotsMultiplier(reels) {
  const [a, b, c] = reels
  if (a === b && b === c) return SYMBOLS.find((s) => s.icon === a).multiplier
  const cherries = reels.filter((r) => r === 'cherry').length
  if (cherries === 2) return 2
  return 0
}
