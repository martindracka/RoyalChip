import { ID, Query } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows, getRow, createRow, updateRow, deleteRow } from './db'

const T = TABLES.promotions

export async function listPromotions({ onlyCurrent = false } = {}) {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(100)]
  if (onlyCurrent) {
    const now = new Date().toISOString()
    queries.push(Query.equal('isActive', true))
    queries.push(Query.lessThanEqual('startsAt', now))
    queries.push(Query.greaterThan('endsAt', now))
  }
  const { rows } = await listRows(T, queries)
  return rows
}

export function getPromotion(id) {
  return getRow(T, id)
}

export function createPromotion(data) {
  return createRow(T, ID.unique(), data)
}

export function updatePromotion(id, data) {
  return updateRow(T, id, data)
}

export function deletePromotion(id) {
  return deleteRow(T, id)
}
