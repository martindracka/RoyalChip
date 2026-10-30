import { describe, it, expect } from 'vitest'
import { validateStake } from '@/composables/useBet'
import { summarizeBets } from '@/services/betService'
import { getRole, can } from '@/lib/roles'
import { required, email, minValue } from '@/composables/useForm'

const game = { minBet: 10, maxBet: 500 }

describe('validateStake', () => {
  it('accepts a valid bet', () => expect(validateStake(50, game, 1000)).toBe(''))
  it('rejects too small / too big bets', () => {
    expect(validateStake(5, game, 1000)).toMatch(/Minimum/)
    expect(validateStake(600, game, 1000)).toMatch(/Maximum/)
  })
  it('rejects bets above balance', () => expect(validateStake(100, game, 50)).toMatch(/Not enough/))
  it('rejects decimals', () => expect(validateStake(10.5, game, 1000)).toMatch(/whole/))
})

describe('summarizeBets', () => {
  it('sums wagers and payouts', () => {
    const s = summarizeBets([
      { amount: 100, payout: 0 },
      { amount: 50, payout: 150 }
    ])
    expect(s).toEqual({ count: 2, wagered: 150, paidOut: 150, houseProfit: 0, winRate: 50 })
  })
})

describe('roles', () => {
  it('maps labels to roles', () => {
    expect(getRole(null)).toBe('guest')
    expect(getRole({ labels: [] })).toBe('player')
    expect(getRole({ labels: ['editor'] })).toBe('editor')
    expect(getRole({ labels: ['editor', 'admin'] })).toBe('admin')
  })
  it('editor cannot delete content, admin can', () => {
    expect(can('editor', 'manage:content')).toBe(true)
    expect(can('editor', 'delete:content')).toBe(false)
    expect(can('admin', 'delete:content')).toBe(true)
    expect(can('guest', 'play')).toBe(false)
  })
})

describe('form rules', () => {
  it('validates', () => {
    expect(required()('')).not.toBe('')
    expect(email()('bad')).not.toBe('')
    expect(email()('a@b.cz')).toBe('')
    expect(minValue(1)(0)).not.toBe('')
  })
})
