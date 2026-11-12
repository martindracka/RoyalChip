// Blackjack needs several requests per round (deal -> hit -> stand), so the round is stored
// in the "blackjackRounds" table. Players have NO permissions on that table: the deck and the
// dealer's hidden card never leave the server, so they cannot be peeked at or changed.
import { createDeck, shuffle, handValue, isBlackjack, isBust, playDealer, settleHands } from '../../../../shared/games/blackjack.js'
import { calcPayout } from '../../../../shared/games/payout.js'
import { conflict } from '../errors.js'
import { loadGameForBet } from './games.js'
import { chargeStake, settleRound, getProfileOrFail } from './wallet.js'

const ROUNDS = 'blackjackRounds'

// The row is stored with JSON strings; this turns it back into objects.
function parse(row) {
  if (!row) return null
  return { ...row, deck: JSON.parse(row.deck), player: JSON.parse(row.player), dealer: JSON.parse(row.dealer) }
}

function serialize(round) {
  return {
    gameId: round.gameId,
    stake: round.stake,
    status: round.status,
    open: round.status === 'playing' ? 1 : 0,
    result: round.result ?? null,
    payout: round.payout ?? 0,
    deck: JSON.stringify(round.deck),
    player: JSON.stringify(round.player),
    dealer: JSON.stringify(round.dealer)
  }
}

// What the browser is allowed to see: never the deck, and only the dealer's first card while playing.
export function publicRound(round) {
  if (!round) return null
  const playing = round.status === 'playing'
  const dealer = playing ? round.dealer.slice(0, 1) : round.dealer
  return {
    gameId: round.gameId,
    status: round.status,
    stake: round.stake,
    player: round.player,
    dealer,
    dealerHidden: playing,
    playerTotal: handValue(round.player),
    dealerTotal: handValue(dealer),
    result: round.result ?? null,
    payout: round.payout ?? 0
  }
}

async function saveRound(db, userId, round, exists) {
  const data = serialize(round)
  // One row per player (row ID = user ID). No permissions -> only this function can touch it.
  return exists ? db.update(ROUNDS, userId, data) : db.create(ROUNDS, userId, data, {})
}

async function loadPlayingRound(db, userId) {
  const round = parse(await db.get(ROUNDS, userId))
  if (!round || round.status !== 'playing') throw conflict('There is no hand in progress. Press Deal.')
  return round
}

async function finishRound(db, userId, round) {
  if (!isBust(round.player) && !isBlackjack(round.player)) {
    const played = playDealer(round.dealer, round.deck)
    round.dealer = played.dealer
    round.deck = played.deck
  }
  const { result, multiplier } = settleHands(round.player, round.dealer)
  round.status = 'finished'
  round.result = result
  round.payout = calcPayout(round.stake, multiplier)

  // Close the round ATOMICALLY before paying: open goes 1 -> 0 only once. If two "stand"
  // requests arrive at the same moment, the second one fails here and nothing is paid twice.
  try {
    await db.decrement(ROUNDS, userId, 'open', 1, 0)
  } catch {
    throw conflict('This hand is already finished.')
  }
  await db.update(ROUNDS, userId, serialize(round))
  const game = (await db.get('games', round.gameId)) || { $id: round.gameId, name: 'Blackjack', type: 'blackjack' }
  const profile = await getProfileOrFail(db, userId)
  const outcome = `${result.toUpperCase()} – you ${handValue(round.player)}, dealer ${handValue(round.dealer)}`
  const updated = await settleRound(db, { userId, profile, game, stake: round.stake, payout: round.payout, outcome })
  return { round: publicRound(round), profile: updated }
}

export async function getState(db, userId) {
  return { round: publicRound(parse(await db.get(ROUNDS, userId))) }
}

export async function deal(db, userId, payload) {
  const existing = parse(await db.get(ROUNDS, userId))
  if (existing?.status === 'playing') throw conflict('Finish your current hand first.')

  const { game, stake } = await loadGameForBet(db, userId, payload, 'blackjack')
  await chargeStake(db, userId, stake)

  const deck = shuffle(createDeck())
  const round = { gameId: game.$id, stake, status: 'playing', deck, player: [deck.pop(), deck.pop()], dealer: [deck.pop(), deck.pop()] }
  await saveRound(db, userId, round, Boolean(existing))

  if (isBlackjack(round.player)) return finishRound(db, userId, round)
  return { round: publicRound(round), profile: await getProfileOrFail(db, userId) }
}

export async function hit(db, userId) {
  const round = await loadPlayingRound(db, userId)
  round.player.push(round.deck.pop())
  if (isBust(round.player) || handValue(round.player) === 21) return finishRound(db, userId, round)
  // Write only the cards – never the status – so a hit can't reopen a hand that was just closed.
  await db.update(ROUNDS, userId, { deck: JSON.stringify(round.deck), player: JSON.stringify(round.player) })
  return { round: publicRound(round) }
}

export async function stand(db, userId) {
  return finishRound(db, userId, await loadPlayingRound(db, userId))
}
