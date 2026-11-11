<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { listGames, updateGame, deleteGame } from '@/services/gameService'
import { getImageUrl } from '@/services/storageService'
import { gameTypeInfo, formatChips } from '@/lib/format'
import { toMessage } from '@/lib/errors'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth = useAuthStore()
const toast = useToast()
const { confirm } = useConfirm()
const { data: games, loading, error, run } = useAsync(() => listGames(), { initialData: [] })

const search = ref('')
const busyId = ref(null)
const filtered = computed(() =>
  games.value.filter((g) => g.name.toLowerCase().includes(search.value.trim().toLowerCase()))
)

// Quick "Update" without opening the form.
async function toggleActive(game) {
  busyId.value = game.$id
  try {
    await updateGame(game, { isActive: !game.isActive })
    toast.success(`${game.name} is now ${game.isActive ? 'hidden' : 'visible'}.`)
    await run()
  } catch (e) {
    toast.error(toMessage(e))
  } finally {
    busyId.value = null
  }
}

async function remove(game) {
  const ok = await confirm({
    title: `Delete "${game.name}"?`,
    message: 'The game and its cover image will be permanently removed. Bet history is kept.',
    confirmLabel: 'Delete'
  })
  if (!ok) return
  busyId.value = game.$id
  try {
    await deleteGame(game)
    toast.success('Game deleted.')
    await run()
  } catch (e) {
    toast.error(toMessage(e))
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>Games</h1>
        <p>Create, edit and publish casino games.</p>
      </div>
      <BaseButton :to="{ name: 'admin-game-new' }">+ New game</BaseButton>
    </header>

    <div class="toolbar">
      <label class="sr-only" for="admin-game-search">Filter games</label>
      <input id="admin-game-search" v-model="search" type="search" placeholder="Filter by name…" />
    </div>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState v-else-if="!games.length" icon="gamepad" title="No games yet" message="Create the first game of your casino.">
      <BaseButton :to="{ name: 'admin-game-new' }">+ New game</BaseButton>
    </EmptyState>
    <EmptyState v-else-if="!filtered.length" icon="search" title="No games match the filter" />
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Game</th>
            <th scope="col">Type</th>
            <th scope="col">Bet limits</th>
            <th scope="col">Status</th>
            <th scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in filtered" :key="game.$id">
            <td>
              <div class="name">
                <img v-if="game.imageId" :src="getImageUrl(game.imageId)" alt="" class="thumb" />
                <span v-else class="thumb placeholder" aria-hidden="true"><AppIcon :name="gameTypeInfo(game.type).icon" :size="22" /></span>
                {{ game.name }}
              </div>
            </td>
            <td>{{ gameTypeInfo(game.type).label }}</td>
            <td>{{ formatChips(game.minBet) }} – {{ formatChips(game.maxBet) }}</td>
            <td>
              <StatusBadge :tone="game.isActive ? 'success' : 'neutral'" :label="game.isActive ? 'Live' : 'Hidden'" />
            </td>
            <td class="actions">
              <BaseButton size="sm" variant="ghost" :loading="busyId === game.$id" @click="toggleActive(game)">
                {{ game.isActive ? 'Hide' : 'Publish' }}
              </BaseButton>
              <BaseButton size="sm" variant="secondary" :to="{ name: 'admin-game-edit', params: { id: game.$id } }">
                Edit
              </BaseButton>
              <BaseButton
                v-if="auth.hasPermission('delete:content')"
                size="sm"
                variant="danger"
                :disabled="busyId === game.$id"
                @click="remove(game)"
              >
                Delete
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.toolbar input {
  max-width: 320px;
}
.name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}
.thumb {
  width: 48px;
  height: 32px;
  object-fit: cover;
  border-radius: 6px;
}
.placeholder {
  display: grid;
  place-items: center;
  background: var(--surface-2);
}
</style>
