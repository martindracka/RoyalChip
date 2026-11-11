<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAsync } from '@/composables/useAsync'
import { listGames } from '@/services/gameService'
import { GAME_TYPES } from '@/lib/format'
import GameCard from '@/components/games/GameCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
// the home page links here with ?type=slots etc.
const type = ref(GAME_TYPES.some((t) => t.value === route.query.type) ? route.query.type : '')
const search = ref('')

// Filtering happens in Appwrite (Query.equal / Query.search), not in the browser.
const { data: games, loading, error, run } = useAsync(
  () => listGames({ onlyActive: true, type: type.value, search: search.value.trim() }),
  { initialData: [] }
)

// Wait until the user stops typing before asking the server again (debounce).
let timer
watch([type, search], () => {
  clearTimeout(timer)
  timer = setTimeout(run, 300)
})
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>Games</h1>
        <p>Pick a table and test your luck – new rounds start instantly.</p>
      </div>
    </header>

    <div class="toolbar" role="search">
      <label class="sr-only" for="game-search">Search games</label>
      <input id="game-search" v-model="search" type="search" placeholder="Search by name…" class="search" />
    </div>

    <div class="chips" role="group" aria-label="Game type">
      <button type="button" class="chip" :aria-pressed="type === ''" @click="type = ''">All games</button>
      <button
        v-for="t in GAME_TYPES"
        :key="t.value"
        type="button"
        class="chip"
        :aria-pressed="type === t.value"
        @click="type = t.value"
      >
        <AppIcon :name="t.icon" :size="16" /> {{ t.label }}
      </button>
    </div>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState
      v-else-if="!games.length"
      icon="search"
      title="No games found"
      message="Try a different search or game type."
    />
    <div v-else class="grid">
      <GameCard v-for="game in games" :key="game.$id" :game="game" />
    </div>
  </div>
</template>

<style scoped>
.search {
  flex: 1;
  min-width: 200px;
  max-width: 420px;
  padding-left: 2.5rem;
  background: var(--bg-elevated)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' stroke='%239ea3c4' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='m20 20-3.5-3.5'/%3E%3C/svg%3E")
    no-repeat 0.85rem center;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font: inherit;
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.chip:hover {
  color: var(--text);
  border-color: var(--border-strong);
}
.chip[aria-pressed='true'] {
  color: #241600;
  background: var(--gold-gradient);
  border-color: transparent;
}
</style>
