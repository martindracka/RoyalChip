import { ID, Query, Permission, Role } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows, createRow, deleteRow } from './db'

const T = TABLES.bets

// A bet is an immutable record of one finished round.
// The player may only READ it – no update/delete permission, so history can't be edited.
export function recordBet({ userId, username, game, amount, payout, outcome }) {
  const data = {
    userId,
    username,
    gameId: game.$id,
    gameName: game.name,
    gameType: game.type,
    amount,
    payout,
    outcome
  }
  return createRow(T, ID.unique(), data, [Permission.read(Role.user(userId))])
}

export async function listMyBets(userId, limit = 25) {
  const { rows } = await listRows(T, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(limit)
  ])
  return rows
}

export async function listAllBets({ gameType = '', limit = 100 } = {}) {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(limit)]
  if (gameType) queries.push(Query.equal('gameType', gameType))
  const { rows } = await listRows(T, queries)
  return rows
}

export function deleteBet(id) {
  return deleteRow(T, id)
}

// Pure function – easy to unit test.
export function summarizeBets(bets) {
  const wagered = bets.reduce((sum, b) => sum + b.amount, 0)
  const paidOut = bets.reduce((sum, b) => sum + b.payout, 0)
  const wins = bets.filter((b) => b.payout > b.amount).length
  return {
    count: bets.length,
    wagered,
    paidOut,
    houseProfit: wagered - paidOut,
    winRate: bets.length ? Math.round((wins / bets.length) * 100) : 0
  }
}
