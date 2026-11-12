// Maps an action name from the request to the function that handles it.
// An allow-list: any other action name is rejected.
import { badRequest } from './errors.js'
import { playGame } from './actions/games.js'
import * as blackjack from './actions/blackjack.js'
import { initProfile, renameProfile, refillBalance } from './actions/profile.js'
import { claimPromotion, claimReferral } from './actions/rewards.js'

const ACTIONS = {
  'profile.init': (ctx, p) => initProfile(ctx.db, ctx.userId, p, ctx.user),
  'profile.rename': (ctx, p) => renameProfile(ctx.db, ctx.userId, p),
  'profile.refill': (ctx) => refillBalance(ctx.db, ctx.userId),
  'game.play': (ctx, p) => playGame(ctx.db, ctx.userId, p),
  'blackjack.state': (ctx) => blackjack.getState(ctx.db, ctx.userId),
  'blackjack.deal': (ctx, p) => blackjack.deal(ctx.db, ctx.userId, p),
  'blackjack.hit': (ctx) => blackjack.hit(ctx.db, ctx.userId),
  'blackjack.stand': (ctx) => blackjack.stand(ctx.db, ctx.userId),
  'promotion.claim': (ctx, p) => claimPromotion(ctx.db, ctx.userId, p),
  'referral.claim': (ctx, p) => claimReferral(ctx.db, ctx.userId, p)
}

// ctx = { db, userId, user } – userId comes from Appwrite, never from the request body.
export function handle(ctx, action, payload) {
  if (!Object.hasOwn(ACTIONS, action)) throw badRequest('Unknown action')
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) throw badRequest('Invalid payload')
  return ACTIONS[action](ctx, payload)
}
