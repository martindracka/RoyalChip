// Creates the database, tables, columns, indexes, storage bucket and demo data in Appwrite.
// Run with:  npm run setup:appwrite   (reads .env, needs APPWRITE_API_KEY)
// It is safe to run several times – things that already exist are skipped.
import { Client, TablesDB, Storage, ID, Query } from 'node-appwrite'
import { DATABASE, TABLES, BUCKET, SEED } from './schema.js'
import { deployFunction } from './deploy-function.js'

const { VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env

if (!VITE_APPWRITE_ENDPOINT || !VITE_APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('❌ Missing VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env')
  process.exit(1)
}

const client = new Client()
  .setEndpoint(VITE_APPWRITE_ENDPOINT)
  .setProject(VITE_APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY)

const db = new TablesDB(client)
const storage = new Storage(client)
const databaseId = DATABASE.id
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Runs `create`; if the resource already exists (409) it just says so.
async function ensure(label, create) {
  try {
    await create()
    console.log(`  ✔ created ${label}`)
  } catch (error) {
    if (error.code === 409) console.log(`  • ${label} already exists`)
    else throw new Error(`${label}: ${error.message}`)
  }
}

function createColumn(tableId, col) {
  const base = { databaseId, tableId, key: col.key, required: col.required }
  const withDefault = col.required ? {} : { xdefault: col.xdefault ?? null }
  switch (col.type) {
    case 'varchar':
      return db.createVarcharColumn({ ...base, ...withDefault, size: col.size })
    case 'text':
      return db.createTextColumn({ ...base, ...withDefault })
    case 'integer':
      return db.createIntegerColumn({ ...base, ...withDefault, min: col.min, max: col.max })
    case 'boolean':
      return db.createBooleanColumn({ ...base, ...withDefault })
    case 'datetime':
      return db.createDatetimeColumn({ ...base, ...withDefault })
    case 'enum':
      return db.createEnumColumn({ ...base, ...withDefault, elements: col.elements })
    default:
      throw new Error(`Unknown column type ${col.type}`)
  }
}

// Columns are created in the background; indexes can only be added once they are "available".
async function waitForColumns(tableId) {
  for (let i = 0; i < 60; i++) {
    const { columns } = await db.listColumns({ databaseId, tableId })
    const failed = columns.find((c) => c.status === 'failed')
    if (failed) throw new Error(`Column ${tableId}.${failed.key} failed: ${failed.error}`)
    if (columns.every((c) => c.status === 'available')) return
    await sleep(1000)
  }
  throw new Error(`Timed out waiting for columns of ${tableId}`)
}

async function setupTable(table) {
  console.log(`\n📋 Table "${table.id}"`)
  await ensure(`table ${table.id}`, () =>
    db.createTable({
      databaseId,
      tableId: table.id,
      name: table.name,
      permissions: table.permissions,
      rowSecurity: table.rowSecurity
    })
  )
  // Make sure permissions are up to date even if the table existed before
  await db.updateTable({
    databaseId,
    tableId: table.id,
    name: table.name,
    permissions: table.permissions,
    rowSecurity: table.rowSecurity
  })

  for (const col of table.columns) {
    await ensure(`column ${col.key}`, () => createColumn(table.id, col))
  }
  await waitForColumns(table.id)

  for (const index of table.indexes) {
    await ensure(`index ${index.key}`, () =>
      db.createIndex({ databaseId, tableId: table.id, key: index.key, type: index.type, columns: index.columns })
    )
  }
}

async function waitForIndexes(tableId) {
  for (let i = 0; i < 60; i++) {
    const table = await db.getTable({ databaseId, tableId })
    if ((table.indexes || []).every((ix) => ix.status === 'available')) return
    await sleep(1000)
  }
}

async function seed(tableId, rows) {
  const { total } = await db.listRows({ databaseId, tableId, queries: [Query.limit(1)] })
  if (total > 0) {
    console.log(`  • ${tableId} already has data – skipping demo rows`)
    return
  }
  await waitForIndexes(tableId)
  for (const data of rows) {
    await db.createRow({ databaseId, tableId, rowId: ID.unique(), data })
  }
  console.log(`  ✔ added ${rows.length} demo ${tableId}`)
}

async function main() {
  console.log(`🎰 Setting up Appwrite project ${VITE_APPWRITE_PROJECT_ID}`)

  await ensure(`database ${databaseId}`, () => db.create({ databaseId, name: DATABASE.name }))
  for (const table of TABLES) await setupTable(table)

  console.log('\n🖼  Storage')
  const { id: bucketId, ...bucketOptions } = BUCKET
  await ensure(`bucket ${bucketId}`, () => storage.createBucket({ bucketId, ...bucketOptions, fileSecurity: false }))
  // keep size/type limits and permissions up to date on an existing bucket
  await storage.updateBucket({ bucketId, ...bucketOptions, fileSecurity: false })

  console.log('\n⚙  Casino Function (server-side game engine)')
  await deployFunction(client)

  console.log('\n🌱 Demo data')
  await seed('games', SEED.games)
  await seed('promotions', SEED.promotions)
  await seed('profiles', SEED.profiles)

  console.log('\n✅ Done! Next: register in the app, then run  npm run set-role -- your@email.com admin')
}

main().catch((error) => {
  console.error(`\n❌ ${error.message}`)
  process.exit(1)
})
