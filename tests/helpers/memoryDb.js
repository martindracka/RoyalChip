// In-memory version of functions/casino/src/appwriteDb.js for the unit tests.
// It copies the Appwrite behaviour the security relies on: unique indexes (409),
// duplicate row IDs (409) and the atomic decrement with a minimum.
const UNIQUE = {
  profiles: [['username']],
  claims: [['userId', 'promotionId']],
  referralRewards: [['referredId']]
}

const appwriteError = (code, message) => Object.assign(new Error(message), { code })
let counter = 0

export function createMemoryDb(initial = {}) {
  const tables = {}
  for (const [name, rows] of Object.entries(initial)) tables[name] = rows.map((r) => ({ ...r }))
  const rows = (t) => (tables[t] ??= [])
  const find = (t, id) => rows(t).find((r) => r.$id === id)

  function checkUnique(t, row) {
    for (const cols of UNIQUE[t] || []) {
      const clash = rows(t).find((r) => r.$id !== row.$id && cols.every((c) => r[c] === row[c] && row[c] != null))
      if (clash) throw appwriteError(409, `Unique index violated on ${t}`)
    }
  }

  return {
    tables,
    async get(t, id) {
      const row = find(t, id)
      return row ? { ...row } : null
    },
    async create(t, id, data, options = {}) {
      const $id = id ?? `row${++counter}`
      if (find(t, $id)) throw appwriteError(409, 'Row already exists')
      const row = { $id, $createdAt: new Date().toISOString(), ...data, $readableBy: options.readableBy ?? null }
      checkUnique(t, row)
      rows(t).push(row)
      return { ...row }
    },
    async update(t, id, data) {
      const row = find(t, id)
      if (!row) throw appwriteError(404, 'Row not found')
      checkUnique(t, { ...row, ...data })
      Object.assign(row, data)
      return { ...row }
    },
    async increment(t, id, column, value) {
      const row = find(t, id)
      if (!row) throw appwriteError(404, 'Row not found')
      row[column] = (row[column] || 0) + value
      return { ...row }
    },
    async decrement(t, id, column, value, min) {
      const row = find(t, id)
      if (!row) throw appwriteError(404, 'Row not found')
      if (min != null && (row[column] || 0) - value < min) throw appwriteError(400, 'Value would go below minimum')
      row[column] = (row[column] || 0) - value
      return { ...row }
    },
    async findOne(t, column, value) {
      const row = rows(t).find((r) => r[column] === value)
      return row ? { ...row } : null
    },
    async count(t, column, value) {
      return rows(t).filter((r) => r[column] === value).length
    }
  }
}
