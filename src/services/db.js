// Thin wrapper around Appwrite TablesDB so the other services stay short
// and only describe *what* they need, not *how* to call the SDK.
import { tablesDB, DATABASE_ID } from '@/lib/appwrite'

export async function listRows(tableId, queries = []) {
  const res = await tablesDB.listRows({ databaseId: DATABASE_ID, tableId, queries })
  return { rows: res.rows, total: res.total }
}

export function getRow(tableId, rowId) {
  return tablesDB.getRow({ databaseId: DATABASE_ID, tableId, rowId })
}

export function createRow(tableId, rowId, data, permissions) {
  return tablesDB.createRow({ databaseId: DATABASE_ID, tableId, rowId, data, permissions })
}

export function updateRow(tableId, rowId, data) {
  return tablesDB.updateRow({ databaseId: DATABASE_ID, tableId, rowId, data })
}

export function deleteRow(tableId, rowId) {
  return tablesDB.deleteRow({ databaseId: DATABASE_ID, tableId, rowId })
}
