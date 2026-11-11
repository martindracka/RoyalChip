import { describe, it, expect, vi, beforeEach } from 'vitest'

// Replace the Appwrite layer with fakes so we can test the referral rules without a server.
vi.mock('@/lib/appwrite', () => ({ TABLES: { profiles: 'profiles' } }))
vi.mock('@/services/db', () => ({
  getRow: vi.fn(),
  createRow: vi.fn((table, id, data) => Promise.resolve({ $id: id, ...data })),
  listRows: vi.fn(),
  updateRow: vi.fn(),
  deleteRow: vi.fn()
}))

import { getRow } from '@/services/db'
import { getOrCreateProfile, STARTING_BALANCE } from '@/services/profileService'
import { FRIEND_BONUS } from '@/lib/referral'

const newUser = { $id: 'newbie', name: 'Newbie', email: 'n@test.com' }
const notFound = () => Object.assign(new Error('not found'), { code: 404 })

describe('creating a profile from an invite link', () => {
  beforeEach(() => {
    vi.mocked(getRow).mockReset()
  })

  it('stores the inviter and adds the friend bonus when the inviter exists', async () => {
    vi.mocked(getRow).mockImplementation((t, id) => (id === 'friend1' ? Promise.resolve({ $id: id }) : Promise.reject(notFound())))
    const profile = await getOrCreateProfile(newUser, { referredBy: 'friend1' })
    expect(profile.referredBy).toBe('friend1')
    expect(profile.balance).toBe(STARTING_BALANCE + FRIEND_BONUS)
  })

  it('ignores a code of a player that does not exist', async () => {
    vi.mocked(getRow).mockImplementation(() => Promise.reject(notFound()))
    const profile = await getOrCreateProfile(newUser, { referredBy: 'ghost' })
    expect(profile.referredBy).toBeNull()
    expect(profile.balance).toBe(STARTING_BALANCE)
  })

  it('does not let players invite themselves', async () => {
    vi.mocked(getRow).mockImplementation(() => Promise.reject(notFound()))
    const profile = await getOrCreateProfile(newUser, { referredBy: 'newbie' })
    expect(profile.referredBy).toBeNull()
  })
})
