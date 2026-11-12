// Security tests for the Appwrite Function (functions/casino).
// Each test is an attack a player could try by calling the API directly, without our UI.
import { describe, it, expect, beforeEach } from 'vitest'
import { handle } from '../functions/casino/src/handler.js'
import { cleanUsername } from '../functions/casino/src/actions/profile.js'
import { createMemoryDb } from './helpers/memoryDb.js'
import { STARTING_BALANCE, FRIEND_BONUS, REFERRAL_REWARD, WAGER_TARGET, MAX_REFERRAL_REWARDS } from '../shared/rules.js'

const day = 86400000
const iso = (offset) => new Date(Date.now() + offset).toISOString()

const profile = (id, extra = {}) => ({
  $id: id,
  username: id,
  balance: 1000,
  totalWagered: 0,
  totalWon: 0,
  gamesPlayed: 0,
  referredBy: null,
  ...extra
})

function seed() {
  return createMemoryDb({
    games: [
      { $id: 'slots1', name: 'Lucky Sevens', type: 'slots', minBet: 10, maxBet: 500, isActive: true },
      { $id: 'coin1', name: 'Golden Coin', type: 'coinflip', minBet: 5, maxBet: 1000, isActive: true },
      { $id: 'hidden1', name: 'Secret', type: 'slots', minBet: 1, maxBet: 100, isActive: false },
      { $id: 'bj1', name: 'Blackjack', type: 'blackjack', minBet: 20, maxBet: 1000, isActive: true }
    ],
    promotions: [
      { $id: 'live', title: 'Live', bonusAmount: 500, startsAt: iso(-day), endsAt: iso(day), isActive: true },
      { $id: 'expired', title: 'Old', bonusAmount: 500, startsAt: iso(-9 * day), endsAt: iso(-day), isActive: true },
      { $id: 'off', title: 'Off', bonusAmount: 500, startsAt: iso(-day), endsAt: iso(day), isActive: false }
    ],
    profiles: [profile('alice'), profile('bob', { referredBy: 'alice', totalWagered: 600 }), profile('carol')]
  })
}

let db
const call = (userId, action, payload = {}) => handle({ db, userId, user: { name: userId } }, action, payload)
const balanceOf = async (id) => (await db.get('profiles', id)).balance

beforeEach(() => {
  db = seed()
})

describe('requests in general', () => {
  it('rejects unknown actions', () => {
    expect(() => call('alice', 'profile.setBalance', { balance: 1e9 })).toThrow('Unknown action')
  })
  it('rejects a payload that is not an object', () => {
    expect(() => call('alice', 'game.play', 'x')).toThrow('Invalid payload')
  })
})

describe('betting', () => {
  it('takes the stake and pays out exactly what the server decided', async () => {
    const res = await call('alice', 'game.play', { gameId: 'coin1', amount: 100, choice: 'heads' })
    expect(await balanceOf('alice')).toBe(1000 - 100 + res.payout)
    expect([0, 196]).toContain(res.payout)
    expect(db.tables.bets).toHaveLength(1)
    expect(db.tables.bets[0]).toMatchObject({ userId: 'alice', amount: 100, $readableBy: 'alice' })
  })

  it('ignores a payout or result sent by the client', async () => {
    const res = await call('alice', 'game.play', { gameId: 'coin1', amount: 100, choice: 'heads', payout: 99999, side: 'heads' })
    expect(res.payout).toBeLessThanOrEqual(196)
  })

  it.each([
    [{ amount: 5000 }, 'Maximum bet'],
    [{ amount: 1 }, 'Minimum bet'],
    [{ amount: -50 }, 'whole number'],
    [{ amount: 10.5 }, 'whole number'],
    [{ amount: '100abc' }, 'whole number']
  ])('rejects an invalid stake %o', async (extra, message) => {
    await expect(call('alice', 'game.play', { gameId: 'slots1', ...extra })).rejects.toThrow(message)
    expect(await balanceOf('alice')).toBe(1000)
  })

  it('rejects a stake higher than the balance', async () => {
    await db.update('profiles', 'alice', { balance: 50 })
    await expect(call('alice', 'game.play', { gameId: 'coin1', amount: 100, choice: 'tails' })).rejects.toThrow('Not enough chips')
  })

  it('cannot spend the same chips twice with parallel requests', async () => {
    await db.update('profiles', 'alice', { balance: 100 })
    const bets = Array.from({ length: 5 }, () => call('alice', 'game.play', { gameId: 'coin1', amount: 100, choice: 'heads' }))
    const results = await Promise.allSettled(bets)
    const wagered = (await db.get('profiles', 'alice')).totalWagered
    // Whatever was won in between, the balance never went negative and only affordable bets ran.
    expect(await balanceOf('alice')).toBeGreaterThanOrEqual(0)
    expect(results.filter((r) => r.status === 'fulfilled').length * 100).toBe(wagered)
  })

  it('refuses hidden (inactive) games and invalid IDs', async () => {
    await expect(call('alice', 'game.play', { gameId: 'hidden1', amount: 10 })).rejects.toThrow('not available')
    await expect(call('alice', 'game.play', { gameId: '../../etc', amount: 10 })).rejects.toThrow('Invalid game')
  })

  it('rejects invalid game choices before taking any chips', async () => {
    await expect(call('alice', 'game.play', { gameId: 'coin1', amount: 100, choice: 'edge' })).rejects.toThrow('heads or tails')
    expect(await balanceOf('alice')).toBe(1000)
  })
})

describe('blackjack', () => {
  it('never sends the deck or the dealer hole card to the browser', async () => {
    const { round } = await call('alice', 'blackjack.deal', { gameId: 'bj1', amount: 100 })
    expect(round.deck).toBeUndefined()
    if (round.status === 'playing') expect(round.dealer).toHaveLength(1)
  })

  it('cannot start a second hand while one is running, and stand pays only once', async () => {
    const first = await call('alice', 'blackjack.deal', { gameId: 'bj1', amount: 100 })
    if (first.round.status === 'playing') {
      await expect(call('alice', 'blackjack.deal', { gameId: 'bj1', amount: 100 })).rejects.toThrow('current hand')
      await call('alice', 'blackjack.stand')
    }
    const after = await balanceOf('alice')
    await expect(call('alice', 'blackjack.stand')).rejects.toThrow('no hand in progress')
    expect(await balanceOf('alice')).toBe(after)
  })

  it('pays a hand only once when stand is sent several times in parallel', async () => {
    // keep dealing until we get a hand that is still running (not an instant blackjack)
    let res = await call('alice', 'blackjack.deal', { gameId: 'bj1', amount: 100 })
    while (res.round.status !== 'playing') res = await call('alice', 'blackjack.deal', { gameId: 'bj1', amount: 100 })
    const betsBefore = db.tables.bets?.length ?? 0
    const results = await Promise.allSettled([1, 2, 3].map(() => call('alice', 'blackjack.stand')))
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(db.tables.bets.length).toBe(betsBefore + 1) // exactly one payout recorded
  })
})

describe('promotions', () => {
  it('pays the amount from the database once', async () => {
    const res = await call('alice', 'promotion.claim', { promotionId: 'live', amount: 99999 })
    expect(res.amount).toBe(500)
    expect(await balanceOf('alice')).toBe(1500)
    await expect(call('alice', 'promotion.claim', { promotionId: 'live' })).rejects.toThrow('already claimed')
    expect(await balanceOf('alice')).toBe(1500)
  })

  it('cannot be claimed twice with parallel requests', async () => {
    const results = await Promise.allSettled([1, 2, 3].map(() => call('alice', 'promotion.claim', { promotionId: 'live' })))
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(await balanceOf('alice')).toBe(1500)
  })

  it('refuses expired and switched-off promotions', async () => {
    await expect(call('alice', 'promotion.claim', { promotionId: 'expired' })).rejects.toThrow('not running')
    await expect(call('alice', 'promotion.claim', { promotionId: 'off' })).rejects.toThrow('not running')
  })
})

describe('invite rewards', () => {
  it('pays the inviter once when the friend has wagered enough', async () => {
    await call('alice', 'referral.claim', { friendId: 'bob' })
    expect(await balanceOf('alice')).toBe(1000 + REFERRAL_REWARD)
    await expect(call('alice', 'referral.claim', { friendId: 'bob' })).rejects.toThrow('already got')
  })

  it('refuses a player who did not join through my link', async () => {
    await expect(call('carol', 'referral.claim', { friendId: 'bob' })).rejects.toThrow('did not join through your invite link')
  })

  it('refuses a friend who has not wagered enough', async () => {
    await db.update('profiles', 'bob', { totalWagered: WAGER_TARGET - 1 })
    await expect(call('alice', 'referral.claim', { friendId: 'bob' })).rejects.toThrow('not wagered enough')
  })

  it('stops at the reward limit', async () => {
    for (let i = 0; i < MAX_REFERRAL_REWARDS; i++) await db.create('referralRewards', null, { userId: 'alice', referredId: `f${i}` })
    await expect(call('alice', 'referral.claim', { friendId: 'bob' })).rejects.toThrow('limit')
  })
})

describe('profiles', () => {
  it('creates a profile with the server-side starting balance', async () => {
    const { profile: p } = await call('dave', 'profile.init', { balance: 1e9 })
    expect(p.balance).toBe(STARTING_BALANCE)
  })

  it('adds the friend bonus only for a real, different inviter', async () => {
    expect((await call('erin', 'profile.init', { referralCode: 'alice' })).profile.balance).toBe(STARTING_BALANCE + FRIEND_BONUS)
    expect((await call('frank', 'profile.init', { referralCode: 'ghost' })).profile.balance).toBe(STARTING_BALANCE)
    expect((await call('gina', 'profile.init', { referralCode: 'gina' })).profile.referredBy).toBeNull()
  })

  it('returns the existing profile instead of resetting it', async () => {
    await db.update('profiles', 'alice', { balance: 3 })
    expect((await call('alice', 'profile.init')).profile.balance).toBe(3)
  })

  it('cleans account names and avoids duplicate usernames', async () => {
    expect(cleanUsername('<img src=x onerror=alert(1)>')).toBe('img srcx onerroraler') // tags removed, cut to 20 chars
    expect(cleanUsername('!!')).toBe('Player')
    const { profile: p } = await handle({ db, userId: 'hank', user: { name: 'alice' } }, 'profile.init', {})
    expect(p.username).toMatch(/^alice-\d{4}$/)
  })

  it('gives two players registering with the same name at once different usernames', async () => {
    const register = (userId) => handle({ db, userId, user: { name: 'Lucky' } }, 'profile.init', {})
    const [a, b] = await Promise.all([register('p1'), register('p2')])
    expect(a.profile).toBeTruthy()
    expect(b.profile).toBeTruthy()
    expect(a.profile.username).not.toBe(b.profile.username)
  })

  it('refuses two parallel renames to the same name with a clear message', async () => {
    const results = await Promise.allSettled([
      call('alice', 'profile.rename', { username: 'Winner' }),
      call('carol', 'profile.rename', { username: 'Winner' })
    ])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(results.find((r) => r.status === 'rejected').reason.message).toBe('This username is already taken.')
  })

  it('validates renames and refuses taken names', async () => {
    await expect(call('alice', 'profile.rename', { username: 'x' })).rejects.toThrow('at least')
    await expect(call('alice', 'profile.rename', { username: '<script>' })).rejects.toThrow('Use only')
    await expect(call('alice', 'profile.rename', { username: 'bob' })).rejects.toThrow('already taken')
    expect((await call('alice', 'profile.rename', { username: 'Alice W' })).profile.username).toBe('Alice W')
  })

  it('allows a refill only when the player is almost broke', async () => {
    await expect(call('alice', 'profile.refill')).rejects.toThrow('less than')
    await db.update('profiles', 'alice', { balance: 4 })
    expect((await call('alice', 'profile.refill')).profile.balance).toBe(STARTING_BALANCE)
  })
})
