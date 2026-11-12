import { Query } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows, deleteRow } from './db'

const T = TABLES.bets

// Bets are written only by the casino Function. The owner may READ them (row permission),
// admins may delete them, nobody can update them – so the history cannot be edited.

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
