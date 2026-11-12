// Calls the "casino" Appwrite Function. Everything that changes chips goes through here:
// the browser only sends what the player CHOSE, the server decides and returns the result.
import { ExecutionMethod } from 'appwrite'
import { functions, FUNCTION_ID } from '@/lib/appwrite'

export async function callCasino(action, payload = {}) {
  const execution = await functions.createExecution({
    functionId: FUNCTION_ID,
    body: JSON.stringify({ action, payload }),
    async: false,
    method: ExecutionMethod.POST,
    headers: { 'content-type': 'application/json' }
  })

  let response = {}
  try {
    response = JSON.parse(execution.responseBody || '{}')
  } catch {
    // not JSON – handled below as a generic error
  }
  const status = execution.responseStatusCode
  if (status >= 200 && status < 300 && 'data' in response) return response.data

  // Same shape as Appwrite errors, so lib/errors.js can show a friendly message.
  const error = new Error(response.error || 'The casino server did not answer. Please try again.')
  error.code = status || 500
  error.fromServer = Boolean(response.error)
  throw error
}

export const casino = {
  initProfile: (referralCode) => callCasino('profile.init', { referralCode }),
  rename: (username) => callCasino('profile.rename', { username }),
  refill: () => callCasino('profile.refill'),
  play: (gameId, amount, choices = {}) => callCasino('game.play', { ...choices, gameId, amount }),
  blackjackState: () => callCasino('blackjack.state'),
  blackjackDeal: (gameId, amount) => callCasino('blackjack.deal', { gameId, amount }),
  blackjackHit: () => callCasino('blackjack.hit'),
  blackjackStand: () => callCasino('blackjack.stand'),
  claimPromotion: (promotionId) => callCasino('promotion.claim', { promotionId }),
  claimReferral: (friendId) => callCasino('referral.claim', { friendId })
}
