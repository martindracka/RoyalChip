<script setup>
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { getLeaderboard } from '@/services/profileService'
import { formatChips } from '@/lib/format'
import { photoUrl, photoSrcset } from '@/lib/images'
import AppIcon from '@/components/ui/AppIcon.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth = useAuthStore()
const { data: players, loading, error, run } = useAsync(getLeaderboard, { initialData: [] })
const podium = ['gold', 'silver', 'bronze']
</script>

<template>
  <div class="leaderboard">
    <header class="banner">
      <img :src="photoUrl('cards', 1600)" :srcset="photoSrcset('cards')" sizes="100vw" alt="" />
      <div class="banner-text">
        <span class="banner-icon" aria-hidden="true"><AppIcon name="trophy" :size="28" /></span>
        <div>
          <h1>Leaderboard</h1>
          <p>Top 10 players by total chips won.</p>
        </div>
      </div>
    </header>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState v-else-if="!players.length" icon="trophy" title="No players yet" message="Be the first on the board!" />
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Player</th>
            <th scope="col">Total won</th>
            <th scope="col">Rounds played</th>
            <th scope="col">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in players" :key="p.$id" :class="{ me: p.$id === auth.user?.$id }">
            <td>
              <span class="rank" :class="podium[i]">
                <AppIcon v-if="i === 0" name="crown" :size="16" />
                <template v-else>{{ i + 1 }}</template>
              </span>
            </td>
            <td>
              <span class="player">
                <span class="avatar" aria-hidden="true">{{ p.username.charAt(0).toUpperCase() }}</span>
                {{ p.username }}
                <span v-if="p.$id === auth.user?.$id" class="you">You</span>
              </span>
            </td>
            <td class="won">{{ formatChips(p.totalWon) }}</td>
            <td>{{ formatChips(p.gamesPlayed) }}</td>
            <td>{{ formatChips(p.balance) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.banner {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid var(--border);
  padding: 3rem 2rem 2rem;
}
.banner img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
}
.banner::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgb(10 11 20 / 0.95) 25%, rgb(10 11 20 / 0.4));
}
.banner-text {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.banner-icon {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: var(--gold-gradient);
  color: #241600;
  box-shadow: var(--shadow-gold);
}
.banner h1 {
  margin: 0;
}
.banner p {
  margin: 0.2rem 0 0;
  color: rgb(255 255 255 / 0.75);
}
.rank {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 800;
  color: var(--text-muted);
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.rank.gold {
  color: #241600;
  background: var(--gold-gradient);
  border-color: transparent;
}
.rank.silver {
  color: #1f2937;
  background: linear-gradient(135deg, #f1f5f9, #94a3b8);
  border-color: transparent;
}
.rank.bronze {
  color: #2a1406;
  background: linear-gradient(135deg, #f0b27a, #a0522d);
  border-color: transparent;
}
.player {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
}
.avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #2b3150, #1a1f35);
  border: 1px solid var(--border-strong);
}
.you {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #241600;
  background: var(--gold-gradient);
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
.won {
  color: var(--gold);
  font-weight: 700;
}
.me {
  background: rgb(242 185 56 / 0.08);
}
</style>
