import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getOrCreateProfile, updateProfile } from '@/services/profileService'

// Holds the logged-in player's profile (balance + statistics).
export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)

  const balance = computed(() => profile.value?.balance ?? 0)

  // options.referredBy is only used when a new profile is created (registration via invite link)
  async function load(user, options) {
    profile.value = user ? await getOrCreateProfile(user, options) : null
  }

  // Saves changes to Appwrite and keeps the local copy in sync with the server's answer.
  async function save(changes) {
    profile.value = await updateProfile(profile.value.$id, changes)
    return profile.value
  }

  return { profile, balance, load, save }
})
