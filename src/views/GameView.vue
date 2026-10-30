<script setup>
import { computed, watch, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { getGame } from '@/services/gameService'
import { gameTypeInfo } from '@/lib/format'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const props = defineProps({ id: { type: String, required: true } })
const auth = useAuthStore()

// One component per game type, loaded only when needed.
const GAME_COMPONENTS = {
  slots: defineAsyncComponent(() => import('@/components/games/SlotsGame.vue')),
  roulette: defineAsyncComponent(() => import('@/components/games/RouletteGame.vue')),
  blackjack: defineAsyncComponent(() => import('@/components/games/BlackjackGame.vue')),
  dice: defineAsyncComponent(() => import('@/components/games/DiceGame.vue')),
  coinflip: defineAsyncComponent(() => import('@/components/games/CoinflipGame.vue'))
}

const { data: game, loading, error, run } = useAsync(() => getGame(props.id))
watch(() => props.id, () => run())

const gameComponent = computed(() => GAME_COMPONENTS[game.value?.type])
// Staff may preview games that are switched off for players.
const available = computed(() => game.value && (game.value.isActive || auth.isStaff))
</script>

<template>
  <div>
    <LoadingState v-if="loading" message="Preparing the table…" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <template v-else-if="game">
      <header class="page-header">
        <div>
          <p class="type">{{ gameTypeInfo(game.type).icon }} {{ gameTypeInfo(game.type).label }}</p>
          <h1>
            {{ game.name }}
            <StatusBadge v-if="!game.isActive" tone="warning" label="Hidden from players" />
          </h1>
          <p>{{ game.description }}</p>
        </div>
        <BaseButton variant="ghost" to="/games">← All games</BaseButton>
      </header>

      <EmptyState
        v-if="!available"
        icon="🚧"
        title="This game is currently unavailable"
        message="Please try one of our other games."
      />
      <EmptyState v-else-if="!auth.isLoggedIn" icon="🔒" title="Log in to play" message="New players get 1,000 free chips.">
        <BaseButton :to="{ name: 'login', query: { redirect: $route.fullPath } }">Log in</BaseButton>
      </EmptyState>
      <component :is="gameComponent" v-else-if="gameComponent" :game="game" />
      <EmptyState v-else icon="❓" title="Unknown game type" />
    </template>
  </div>
</template>

<style scoped>
.type {
  color: var(--gold) !important;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
}
h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
