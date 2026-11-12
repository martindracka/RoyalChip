import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadOrCreateProfile } from '@/services/profileService'
import { casino } from '@/services/casinoApi'

// Holds the logged-in player's profile (balance + statistics).
// The store never writes the balance itself: it only shows what the server returned.
export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)

  const balance = computed(() => profile.value?.balance ?? 0)

  // options.referredBy is only used when a new profile is created (registration via invite link)
  async function load(user, options = {}) {
    profile.value = user ? await loadOrCreateProfile(user, options.referredBy ?? null) : null
  }

  // Every casino Function call returns the fresh profile – keep the local copy in sync.
  function setProfile(updated) {
    if (updated) profile.value = updated
  }

  // Shows the balance without the stake while a game animation is running (display only).
  function showPendingStake(stake) {
    if (profile.value) profile.value = { ...profile.value, balance: profile.value.balance - stake }
  }

  async function rename(username) {
    setProfile((await casino.rename(username)).profile)
  }

  async function refill() {
    setProfile((await casino.refill()).profile)
  }

  return { profile, balance, load, setProfile, showPendingStake, rename, refill }
})
