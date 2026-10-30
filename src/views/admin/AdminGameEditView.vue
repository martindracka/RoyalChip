<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAsync } from '@/composables/useAsync'
import { useToast } from '@/composables/useToast'
import { getGame, createGame, updateGame } from '@/services/gameService'
import { toMessage } from '@/lib/errors'
import GameForm from '@/components/admin/GameForm.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'

// The same view handles "new" (no id) and "edit" (id from the URL).
const props = defineProps({ id: { type: String, default: null } })
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => Boolean(props.id))
const { data: game, loading, error, run } = useAsync(() => (props.id ? getGame(props.id) : null))

async function save(data, imageFile) {
  try {
    if (isEdit.value) await updateGame(game.value, data, imageFile)
    else await createGame(data, imageFile)
    toast.success(isEdit.value ? 'Game updated.' : 'Game created.')
    router.push({ name: 'admin-games' })
  } catch (e) {
    toast.error(toMessage(e))
  }
}
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>{{ isEdit ? 'Edit game' : 'New game' }}</h1>
        <p>{{ isEdit ? 'Change the details of this game.' : 'Add a new game to the casino.' }}</p>
      </div>
    </header>
    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <GameForm v-else :key="game?.$id || 'new'" :game="game" :save="save" />
  </div>
</template>
