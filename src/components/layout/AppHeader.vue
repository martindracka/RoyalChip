<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BalanceChip from './BalanceChip.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const menuOpen = ref(false)

// close the mobile menu after navigating
watch(() => route.fullPath, () => (menuOpen.value = false))

async function handleLogout() {
  await auth.logout()
  toast.info('You have been logged out.')
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="header">
    <div class="container bar">
      <RouterLink to="/" class="logo" aria-label="Royal Chip Casino – home">
        <span class="logo-chip" aria-hidden="true">R</span>
        <span>Royal Chip</span>
      </RouterLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">Toggle menu</span>☰
      </button>

      <nav id="main-nav" class="nav" :class="{ open: menuOpen }" aria-label="Main">
        <RouterLink to="/games">Games</RouterLink>
        <RouterLink to="/promotions">Promotions</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" to="/leaderboard">Leaderboard</RouterLink>
        <RouterLink v-if="auth.isStaff" to="/admin" class="admin-link">Admin</RouterLink>

        <div class="user-area">
          <template v-if="auth.isLoggedIn">
            <BalanceChip />
            <RouterLink to="/profile" class="profile-link">{{ auth.user.name || 'Profile' }}</RouterLink>
            <button type="button" class="link-btn" @click="handleLogout">Log out</button>
          </template>
          <template v-else>
            <RouterLink to="/login">Log in</RouterLink>
            <RouterLink to="/register" class="cta">Join &amp; get 1,000 chips</RouterLink>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgb(7 19 14 / 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: 68px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
}
.logo-chip {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--felt);
  border: 3px dashed #fff;
}
.nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex: 1;
}
.nav a,
.link-btn {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
}
.nav a:hover,
.nav a.router-link-active,
.link-btn:hover {
  color: var(--text);
}
.admin-link {
  color: var(--gold) !important;
}
.user-area {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.link-btn {
  background: none;
  border: 0;
  cursor: pointer;
  font: inherit;
}
.cta {
  background: var(--gold);
  color: #1a1200 !important;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-weight: 700 !important;
}
.menu-toggle {
  display: none;
  margin-left: auto;
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  font-size: 1.3rem;
  padding: 0.2rem 0.7rem;
  cursor: pointer;
}

@media (max-width: 860px) {
  .menu-toggle {
    display: block;
  }
  .nav {
    display: none;
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
  }
  .nav.open {
    display: flex;
  }
  .user-area {
    margin-left: 0;
    flex-wrap: wrap;
  }
}
</style>
