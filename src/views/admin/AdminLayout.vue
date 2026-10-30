<script setup>
import { useAuthStore } from '@/stores/auth'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const auth = useAuthStore()
</script>

<template>
  <div class="admin">
    <aside class="sidebar" aria-label="Administration">
      <p class="who">
        Signed in as <strong>{{ auth.user.name }}</strong>
        <StatusBadge :label="auth.role" tone="warning" />
      </p>
      <nav>
        <RouterLink :to="{ name: 'admin' }" exact-active-class="active">📊 Dashboard</RouterLink>
        <RouterLink :to="{ name: 'admin-games' }" active-class="active">🎰 Games</RouterLink>
        <RouterLink :to="{ name: 'admin-promotions' }" active-class="active">🎁 Promotions</RouterLink>
        <template v-if="auth.hasPermission('manage:players')">
          <RouterLink :to="{ name: 'admin-players' }" active-class="active">👥 Players</RouterLink>
          <RouterLink :to="{ name: 'admin-bets' }" active-class="active">📜 Bet log</RouterLink>
        </template>
      </nav>
    </aside>
    <section class="content">
      <RouterView />
    </section>
  </div>
</template>

<style scoped>
.admin {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 2rem;
  align-items: start;
}
.sidebar {
  position: sticky;
  top: 90px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
}
.who {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: flex-start;
}
nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
nav a {
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
}
nav a:hover {
  background: var(--surface-2);
  color: var(--text);
}
nav a.active {
  background: var(--surface-2);
  color: var(--gold-strong);
}
@media (max-width: 860px) {
  .admin {
    grid-template-columns: minmax(0, 1fr);
  }
  .sidebar {
    position: static;
  }
  nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
