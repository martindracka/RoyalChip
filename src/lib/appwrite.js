// Single place where the Appwrite SDK is configured.
// Every service imports the clients from here instead of creating its own.
import { Client, Account, TablesDB, Storage, Functions } from 'appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID

// Lets the UI show a helpful message instead of crashing when .env is missing.
export const isConfigured = Boolean(endpoint && projectId && projectId !== 'your-project-id')

export const client = new Client()
if (isConfigured) {
  client.setEndpoint(endpoint).setProject(projectId)
}

export const account = new Account(client)
export const tablesDB = new TablesDB(client)
export const storage = new Storage(client)
export const functions = new Functions(client)

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'casino'
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'game-images'
// The server-side game engine (functions/casino) – the only code allowed to change balances.
export const FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_ID || 'casino'

// Table IDs – must match scripts/schema.js
export const TABLES = {
  games: 'games',
  promotions: 'promotions',
  profiles: 'profiles',
  bets: 'bets',
  claims: 'claims',
  referralRewards: 'referralRewards'
}
