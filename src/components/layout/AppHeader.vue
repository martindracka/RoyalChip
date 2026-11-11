<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BalanceChip from './BalanceChip.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

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
        <span>Royal<span class="gold-text">Chip</span></span>
      </RouterLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">Toggle menu</span><AppIcon :name="menuOpen ? 'x' : 'menu'" :size="22" />
      </button>

      <nav id="main-nav" class="nav" :class="{ open: menuOpen }" aria-label="Main">
        <RouterLink to="/games">Games</RouterLink>
        <RouterLink to="/promotions">Promotions <span class="dot" aria-hidden="true"></span></RouterLink>
        <RouterLink to="/invite">Invite friends</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" to="/leaderboard">Leaderboard</RouterLink>
        <RouterLink v-if="auth.isStaff" to="/admin" class="admin-link">Admin</RouterLink>

        <div class="user-area">
          <template v-if="auth.isLoggedIn">
            <BalanceChip />
            <RouterLink to="/profile" class="profile-link">
              <span class="avatar" aria-hidden="true">{{ (auth.user.name || '?').charAt(0).toUpperCase() }}</span>
              <span class="name">{{ auth.user.name || 'Profile' }}</span>
            </RouterLink>
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
  background: rgb(10 11 20 / 0.8);
  backdrop-filter: blur(14px) saturate(140%);
  border-bottom: 1px solid rgb(255 255 255 / 0.06);
}
.bar {
  display: flex;
  align-items: center;
  gap: 2rem;
  min-height: 72px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
  text-decoration: none;
}
.logo-chip {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background:
    radial-gradient(circle, #1b1405 0 42%, transparent 43%),
    repeating-conic-gradient(#f5b82e 0 30deg, #fff3cf 30deg 45deg);
  color: var(--gold-strong);
  font-size: 1rem;
  box-shadow: 0 0 18px rgb(242 185 56 / 0.4);
}
.nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}
.nav > a {
  position: relative;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
}
.nav a,
.link-btn {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s, background 0.15s;
}
.nav > a:hover,
.link-btn:hover {
  color: var(--text);
  background: rgb(255 255 255 / 0.05);
}
.nav > a.router-link-active {
  color: var(--text);
  background: rgb(255 255 255 / 0.08);
}
.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-left: 2px;
  vertical-align: top;
  border-radius: 50%;
  background: var(--pink);
  box-shadow: 0 0 8px var(--pink);
}
.admin-link {
  color: var(--gold) !important;
}
.user-area {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.profile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text) !important;
}
.avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--violet), var(--pink));
  color: #fff;
  font-weight: 700;
}
.link-btn {
  background: none;
  border: 0;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
}
.cta {
  background: var(--gold-gradient);
  color: #241600 !important;
  padding: 0.55rem 1.2rem;
  border-radius: 999px;
  font-weight: 700 !important;
  box-shadow: var(--shadow-gold);
}
.menu-toggle {
  display: none;
  margin-left: auto;
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  font-size: 1.3rem;
  padding: 0.4rem;
  cursor: pointer;
}

@media (max-width: 960px) {
  .menu-toggle {
    display: grid;
    place-items: center;
  }
  .nav {
    display: none;
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
  }
  .nav.open {
    display: flex;
  }
  .user-area {
    margin-left: 0;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }
}
</style>
