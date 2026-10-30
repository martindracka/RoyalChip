import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/services/authService'
import { getRole, can, STAFF_ROLES } from '@/lib/roles'
import { useProfileStore } from './profile'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const initError = ref(null)
  let initPromise = null

  const role = computed(() => getRole(user.value))
  const isLoggedIn = computed(() => Boolean(user.value))
  const isStaff = computed(() => STAFF_ROLES.includes(role.value))
  const isAdmin = computed(() => role.value === 'admin')

  function hasPermission(action) {
    return can(role.value, action)
  }

  async function setUser(newUser) {
    user.value = newUser
    await useProfileStore().load(newUser)
  }

  // Called by the router guard before the first navigation.
  // The promise is cached so the session is only checked once.
  function init() {
    if (!initPromise) {
      initPromise = authService
        .getCurrentUser()
        .then(setUser)
        .catch((error) => {
          initError.value = error
        })
    }
    return initPromise
  }

  async function login(email, password) {
    await setUser(await authService.login(email, password))
  }

  async function register(name, email, password) {
    await setUser(await authService.register(name, email, password))
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      await setUser(null)
    }
  }

  return { user, role, isLoggedIn, isStaff, isAdmin, initError, hasPermission, init, login, register, logout }
})
