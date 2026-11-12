import { randomInt } from './rng.js'

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

// Wheel order of a real European wheel (used for the animation).
export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22,
  18, 29, 7, 28, 12, 35, 3, 26
]

export function numberColor(n) {
  if (n === 0) return 'green'
  return RED_NUMBERS.includes(n) ? 'red' : 'black'
}

export const BET_TYPES = {
  red: { label: 'Red', payout: 2, wins: (n) => numberColor(n) === 'red' },
  black: { label: 'Black', payout: 2, wins: (n) => numberColor(n) === 'black' },
  even: { label: 'Even', payout: 2, wins: (n) => n !== 0 && n % 2 === 0 },
  odd: { label: 'Odd', payout: 2, wins: (n) => n % 2 === 1 },
  low: { label: '1–18', payout: 2, wins: (n) => n >= 1 && n <= 18 },
  high: { label: '19–36', payout: 2, wins: (n) => n >= 19 },
  dozen1: { label: '1st 12', payout: 3, wins: (n) => n >= 1 && n <= 12 },
  dozen2: { label: '2nd 12', payout: 3, wins: (n) => n >= 13 && n <= 24 },
  dozen3: { label: '3rd 12', payout: 3, wins: (n) => n >= 25 },
  straight: { label: 'Single number', payout: 36, wins: (n, pick) => n === pick }
}

export function spinWheel(rand = randomInt) {
  return rand(37)
}

export function rouletteMultiplier(betType, result, pick = null) {
  const bet = BET_TYPES[betType]
  if (!bet) throw new Error(`Unknown bet type: ${betType}`)
  return bet.wins(result, pick) ? bet.payout : 0
}
