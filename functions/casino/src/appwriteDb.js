// Small adapter over the Appwrite server SDK. The actions only use these few methods,
// which also lets the unit tests run the same actions against an in-memory database.
import { TablesDB, ID, Query, Permission, Role } from 'node-appwrite'

export function createAppwriteDb(client, databaseId) {
  const tables = new TablesDB(client)
  const base = (tableId) => ({ databaseId, tableId })

  return {
    async get(tableId, rowId) {
      try {
        return await tables.getRow({ ...base(tableId), rowId })
      } catch (error) {
        if (error.code === 404) return null
        throw error
      }
    },
    // options.readableBy = user ID that may read the row. Nobody gets update/delete rights.
    create(tableId, rowId, data, options = {}) {
      const permissions = options.readableBy ? [Permission.read(Role.user(options.readableBy))] : []
      return tables.createRow({ ...base(tableId), rowId: rowId ?? ID.unique(), data, permissions })
    },
    update(tableId, rowId, data) {
      return tables.updateRow({ ...base(tableId), rowId, data })
    },
    increment(tableId, rowId, column, value) {
      return tables.incrementRowColumn({ ...base(tableId), rowId, column, value })
    },
    // Atomic: fails if the result would drop below `min`.
    decrement(tableId, rowId, column, value, min) {
      return tables.decrementRowColumn({ ...base(tableId), rowId, column, value, min })
    },
    async findOne(tableId, column, value) {
      const res = await tables.listRows({ ...base(tableId), queries: [Query.equal(column, value), Query.limit(1)] })
      return res.rows[0] ?? null
    },
    async count(tableId, column, value) {
      const res = await tables.listRows({ ...base(tableId), queries: [Query.equal(column, value), Query.limit(1)] })
      return res.total
    }
  }
}
