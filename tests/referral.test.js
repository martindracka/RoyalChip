import { describe, it, expect, vi, beforeEach } from 'vitest'

// Replace the Appwrite layer with fakes so we can test the browser side without a server.
vi.mock('@/lib/appwrite', () => ({ TABLES: { profiles: 'profiles' } }))
vi.mock('@/services/db', () => ({ getRow: vi.fn(), listRows: vi.fn(), updateRow: vi.fn(), deleteRow: vi.fn() }))
vi.mock('@/services/casinoApi', () => ({ casino: { initProfile: vi.fn() } }))

import { getRow } from '@/services/db'
import { casino } from '@/services/casinoApi'
import { loadOrCreateProfile } from '@/services/profileService'

const user = { $id: 'newbie', name: 'Newbie' }
const notFound = () => Object.assign(new Error('not found'), { code: 404 })

describe('loading the player profile', () => {
  beforeEach(() => {
    vi.mocked(getRow).mockReset()
    vi.mocked(casino.initProfile).mockReset()
  })

  it('reads an existing profile directly and does not call the server', async () => {
    vi.mocked(getRow).mockResolvedValue({ $id: 'newbie', balance: 42 })
    expect((await loadOrCreateProfile(user, 'friend1')).balance).toBe(42)
    expect(casino.initProfile).not.toHaveBeenCalled()
  })

  it('asks the casino Function to create a missing profile and passes the invite code', async () => {
    vi.mocked(getRow).mockRejectedValue(notFound())
    vi.mocked(casino.initProfile).mockResolvedValue({ profile: { $id: 'newbie', balance: 1250 } })
    const profile = await loadOrCreateProfile(user, 'friend1')
    expect(casino.initProfile).toHaveBeenCalledWith('friend1')
    expect(profile.balance).toBe(1250)
  })
})
