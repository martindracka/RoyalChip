import { Query } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows, getRow, updateRow, deleteRow } from './db'
import { casino } from './casinoApi'

const T = TABLES.profiles

// One profile per user. We reuse the Appwrite user ID as the row ID,
// so a profile can be fetched directly without a query.
export async function getProfile(userId) {
  try {
    return await getRow(T, userId)
  } catch (error) {
    if (error.code === 404) return null
    throw error
  }
}

// Reading is allowed directly. A NEW profile can only be created by the casino Function,
// which sets the starting balance and checks the invite code on the server.
export async function loadOrCreateProfile(user, referralCode = null) {
  const existing = await getProfile(user.$id)
  if (existing) return existing
  const { profile } = await casino.initProfile(referralCode)
  return profile
}

// Players who joined through my invite link.
export async function listReferredFriends(userId) {
  const { rows } = await listRows(T, [Query.equal('referredBy', userId), Query.orderDesc('$createdAt'), Query.limit(100)])
  return rows
}

// Admin only – the table permissions refuse this for players.
export function updateProfile(id, data) {
  return updateRow(T, id, data)
}

export function deleteProfile(id) {
  return deleteRow(T, id)
}

export async function listProfiles({ search = '', orderBy = 'username', limit = 100 } = {}) {
  const queries = [Query.limit(limit)]
  queries.push(orderBy === 'username' ? Query.orderAsc('username') : Query.orderDesc(orderBy))
  if (search) queries.push(Query.startsWith('username', search))
  const { rows } = await listRows(T, queries)
  return rows
}

export function getLeaderboard() {
  return listProfiles({ orderBy: 'totalWon', limit: 10 })
}
