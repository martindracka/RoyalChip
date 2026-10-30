import { Query, Permission, Role } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows, getRow, createRow, updateRow, deleteRow } from './db'

const T = TABLES.profiles
export const STARTING_BALANCE = 1000

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

export function createProfile(user) {
  const data = {
    username: user.name || user.email.split('@')[0],
    balance: STARTING_BALANCE,
    totalWagered: 0,
    totalWon: 0,
    gamesPlayed: 0
  }
  // Row-level permission: only the owner may update this row.
  // Reading (leaderboard) and admin update/delete come from the TABLE permissions.
  // Without this array Appwrite would give the creator read+update+DELETE by default.
  const permissions = [Permission.update(Role.user(user.$id))]
  return createRow(T, user.$id, data, permissions)
}

export async function getOrCreateProfile(user) {
  return (await getProfile(user.$id)) || createProfile(user)
}

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
