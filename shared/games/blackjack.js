import { randomInt } from './rng.js'

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function createDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })))
}

// Fisher–Yates shuffle (returns a new array)
export function shuffle(cards, rand = randomInt) {
  const deck = [...cards]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function cardValue(card) {
  if (card.rank === 'A') return 11
  if (['J', 'Q', 'K'].includes(card.rank)) return 10
  return Number(card.rank)
}

// Aces count as 11 until the hand would bust, then as 1.
export function handValue(hand) {
  let total = hand.reduce((sum, c) => sum + cardValue(c), 0)
  let aces = hand.filter((c) => c.rank === 'A').length
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return total
}

export const isBlackjack = (hand) => hand.length === 2 && handValue(hand) === 21
export const isBust = (hand) => handValue(hand) > 21

// Dealer draws until 17 or more. Returns the new hand and remaining deck.
export function playDealer(hand, deck) {
  const dealer = [...hand]
  const rest = [...deck]
  while (handValue(dealer) < 17) dealer.push(rest.pop())
  return { dealer, deck: rest }
}

// Returns { result, multiplier } – multiplier is applied to the stake.
export function settleHands(player, dealer) {
  if (isBust(player)) return { result: 'bust', multiplier: 0 }
  if (isBlackjack(player) && !isBlackjack(dealer)) return { result: 'blackjack', multiplier: 2.5 }
  if (isBust(dealer)) return { result: 'dealer bust', multiplier: 2 }
  const p = handValue(player)
  const d = handValue(dealer)
  if (p > d) return { result: 'win', multiplier: 2 }
  if (p === d) return { result: 'push', multiplier: 1 }
  return { result: 'lose', multiplier: 0 }
}
