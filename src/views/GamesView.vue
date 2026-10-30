<script setup>
import { ref, watch } from 'vue'
import { useAsync } from '@/composables/useAsync'
import { listGames } from '@/services/gameService'
import { GAME_TYPES } from '@/lib/format'
import GameCard from '@/components/games/GameCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const type = ref('')
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
        <p>Pick a table and test your luck.</p>
      </div>
    </header>

    <div class="toolbar" role="search">
      <label class="sr-only" for="game-search">Search games</label>
      <input id="game-search" v-model="search" type="search" placeholder="Search by name…" class="search" />
      <label class="sr-only" for="game-type">Game type</label>
      <select id="game-type" v-model="type" class="type">
        <option value="">All types</option>
        <option v-for="t in GAME_TYPES" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
      </select>
    </div>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState
      v-else-if="!games.length"
      icon="🔍"
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
}
.type {
  width: auto;
  min-width: 180px;
}
</style>
