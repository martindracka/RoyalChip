import { ID } from 'appwrite'
import { account } from '@/lib/appwrite'

export async function getCurrentUser() {
  try {
    return await account.get()
  } catch (error) {
    if (error.code === 401) return null // not logged in – not an error
    throw error
  }
}

export async function login(email, password) {
  await account.createEmailPasswordSession({ email, password })
  return account.get()
}

export async function register(name, email, password) {
  await account.create({ userId: ID.unique(), email, password, name })
  return login(email, password)
}

export function logout() {
  return account.deleteSession({ sessionId: 'current' })
}
