<script setup>
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { listGames } from '@/services/gameService'
import { listPromotions } from '@/services/promotionService'
import { listAllBets, summarizeBets } from '@/services/betService'
import { listProfiles } from '@/services/profileService'
import { formatChips } from '@/lib/format'
import StatCard from '@/components/ui/StatCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()

// Editors can't read bets or player data (database permissions), so we only ask for it as admin.
async function loadStats() {
  const [games, promotions] = await Promise.all([listGames(), listPromotions()])
  const stats = {
    games: games.length,
    activeGames: games.filter((g) => g.isActive).length,
    promotions: promotions.length
  }
  if (auth.isAdmin) {
    const [bets, players] = await Promise.all([listAllBets({ limit: 500 }), listProfiles({ limit: 500 })])
    Object.assign(stats, { players: players.length, bets: summarizeBets(bets) })
  }
  return stats
}

const { data: stats, loading, error, run } = useAsync(loadStats)
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Overview of the casino.</p>
      </div>
      <div class="toolbar">
        <BaseButton :to="{ name: 'admin-game-new' }">+ New game</BaseButton>
        <BaseButton variant="secondary" :to="{ name: 'admin-promotion-new' }">+ New promotion</BaseButton>
      </div>
    </header>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <template v-else-if="stats">
      <div class="stats">
        <StatCard icon="gamepad" label="Games (active / total)" :value="`${stats.activeGames} / ${stats.games}`" />
        <StatCard icon="gift" label="Promotions" :value="stats.promotions" />
        <template v-if="stats.bets">
          <StatCard icon="users" label="Players" :value="stats.players" />
          <StatCard icon="dices" label="Rounds (last 500)" :value="formatChips(stats.bets.count)" />
          <StatCard icon="banknote" label="Chips wagered" :value="formatChips(stats.bets.wagered)" />
          <StatCard icon="landmark" label="House profit" :value="formatChips(stats.bets.houseProfit)" />
          <StatCard icon="trending" label="Player win rate" :value="`${stats.bets.winRate}%`" />
        </template>
      </div>
      <p v-if="!stats.bets" class="muted note">
        You are signed in as an <strong>editor</strong>: you can create and edit games and promotions. Deleting content
        and managing players is reserved for admins.
      </p>
    </template>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.note {
  margin-top: 1.5rem;
}
</style>
