import { describe, it, expect } from 'vitest'
import { slotsMultiplier, randomSymbol, SYMBOLS } from '@shared/games/slots'
import { rouletteMultiplier, numberColor } from '@shared/games/roulette'
import { handValue, settleHands, createDeck, shuffle, playDealer } from '@shared/games/blackjack'
import { diceMultiplier, diceWins, winChance } from '@shared/games/dice'
import { randomInt } from '@shared/games/rng'
import { calcPayout } from '@shared/games/payout'

const c = (rank) => ({ rank, suit: '♠' })

describe('rng', () => {
  it('stays inside the range', () => {
    for (let i = 0; i < 1000; i++) {
      const n = randomInt(6)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(6)
    }
  })
})

describe('slots', () => {
  it('pays the symbol multiplier for three of a kind', () => {
    expect(slotsMultiplier(['gem', 'gem', 'gem'])).toBe(50)
    expect(slotsMultiplier(['seven', 'seven', 'seven'])).toBe(100)
  })
  it('pays 2x for two cherries', () => {
    expect(slotsMultiplier(['cherry', 'bell', 'cherry'])).toBe(2)
  })
  it('pays nothing otherwise', () => {
    expect(slotsMultiplier(['cherry', 'bell', 'star'])).toBe(0)
  })
  it('picks symbols by weight', () => {
    expect(randomSymbol(() => 0)).toBe(SYMBOLS[0].icon)
    const total = SYMBOLS.reduce((s, x) => s + x.weight, 0)
    expect(randomSymbol(() => total - 1)).toBe(SYMBOLS.at(-1).icon)
  })
})

describe('roulette', () => {
  it('knows the colours', () => {
    expect(numberColor(0)).toBe('green')
    expect(numberColor(1)).toBe('red')
    expect(numberColor(2)).toBe('black')
  })
  it('zero loses on even and red', () => {
    expect(rouletteMultiplier('even', 0)).toBe(0)
    expect(rouletteMultiplier('red', 0)).toBe(0)
  })
  it('pays 36x on a straight hit', () => {
    expect(rouletteMultiplier('straight', 17, 17)).toBe(36)
    expect(rouletteMultiplier('straight', 17, 18)).toBe(0)
  })
  it('pays 3x on dozens', () => {
    expect(rouletteMultiplier('dozen2', 13)).toBe(3)
  })
})

describe('blackjack', () => {
  it('has 52 unique cards after shuffling', () => {
    const deck = shuffle(createDeck())
    expect(new Set(deck.map((x) => x.rank + x.suit)).size).toBe(52)
  })
  it('counts aces as 1 or 11', () => {
    expect(handValue([c('A'), c('K')])).toBe(21)
    expect(handValue([c('A'), c('A'), c('9')])).toBe(21)
    expect(handValue([c('A'), c('K'), c('5')])).toBe(16)
  })
  it('settles results correctly', () => {
    expect(settleHands([c('A'), c('K')], [c('10'), c('9')]).multiplier).toBe(2.5)
    expect(settleHands([c('10'), c('9')], [c('10'), c('8')]).result).toBe('win')
    expect(settleHands([c('10'), c('8')], [c('10'), c('8')]).result).toBe('push')
    expect(settleHands([c('10'), c('8'), c('5')], [c('10'), c('8')]).result).toBe('bust')
    expect(settleHands([c('10'), c('8')], [c('10'), c('6'), c('9')]).result).toBe('dealer bust')
  })
  it('dealer draws to at least 17', () => {
    const { dealer } = playDealer([c('2'), c('3')], shuffle(createDeck()))
    expect(handValue(dealer)).toBeGreaterThanOrEqual(17)
  })
})

describe('dice', () => {
  it('calculates chance and multiplier', () => {
    expect(winChance(50, 'over')).toBe(50)
    expect(winChance(50, 'under')).toBe(49)
    expect(diceMultiplier(50, 'over')).toBe(1.98)
  })
  it('decides wins', () => {
    expect(diceWins(51, 50, 'over')).toBe(true)
    expect(diceWins(50, 50, 'over')).toBe(false)
    expect(diceWins(49, 50, 'under')).toBe(true)
  })
})

describe('payout', () => {
  it('rounds down to whole chips', () => {
    expect(calcPayout(15, 2.5)).toBe(37)
    expect(calcPayout(10, 0)).toBe(0)
  })
})
