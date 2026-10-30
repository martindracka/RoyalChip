<script setup>
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { getLeaderboard } from '@/services/profileService'
import { formatChips } from '@/lib/format'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth = useAuthStore()
const { data: players, loading, error, run } = useAsync(getLeaderboard, { initialData: [] })
const medals = ['🥇', '🥈', '🥉']
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>Leaderboard</h1>
        <p>Top 10 players by total chips won.</p>
      </div>
    </header>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState v-else-if="!players.length" icon="🏆" title="No players yet" message="Be the first on the board!" />
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Player</th>
            <th scope="col">Total won</th>
            <th scope="col">Rounds played</th>
            <th scope="col">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in players" :key="p.$id" :class="{ me: p.$id === auth.user?.$id }">
            <td>{{ medals[i] || i + 1 }}</td>
            <td>{{ p.username }} <span v-if="p.$id === auth.user?.$id" class="muted">(you)</span></td>
            <td>{{ formatChips(p.totalWon) }}</td>
            <td>{{ formatChips(p.gamesPlayed) }}</td>
            <td>{{ formatChips(p.balance) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.me {
  background: rgb(227 179 65 / 0.1);
}
</style>
