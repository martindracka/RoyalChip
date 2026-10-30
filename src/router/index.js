import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// Global navigation guard.
// meta.requiresAuth -> must be logged in
// meta.roles        -> must have one of the listed roles
// meta.guestOnly    -> only for visitors who are NOT logged in (login/register)
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init() // makes sure we know who the user is before deciding

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return { name: 'forbidden' }
  }
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'home' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Royal Chip Casino` : 'Royal Chip Casino'
})

export default router
