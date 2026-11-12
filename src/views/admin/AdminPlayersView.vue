<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useAsync } from '@/composables/useAsync'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { listProfiles, updateProfile, deleteProfile } from '@/services/profileService'
import { toMessage } from '@/lib/errors'
import { validateUsername } from '@shared/rules.js'
import PlayerRow from '@/components/admin/PlayerRow.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth = useAuthStore()
const profileStore = useProfileStore()
const toast = useToast()
const { confirm } = useConfirm()
const search = ref('')
const busyId = ref(null)

const { data: players, loading, error, run } = useAsync(() => listProfiles({ search: search.value.trim() }), {
  initialData: []
})

let timer
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(run, 300)
})

async function withBusy(id, action, successMessage) {
  busyId.value = id
  try {
    await action()
    toast.success(successMessage)
    await run()
  } catch (e) {
    toast.error(toMessage(e))
  } finally {
    busyId.value = null
  }
}

function save(player, changes) {
  const nameError = validateUsername(changes.username)
  if (nameError) return toast.error(nameError)
  withBusy(
    player.$id,
    async () => {
      await updateProfile(player.$id, changes)
      // editing yourself -> refresh the balance in the header too
      if (player.$id === auth.user.$id) await profileStore.load(auth.user)
    },
    `${changes.username} updated.`
  )
}

async function remove(player) {
  const ok = await confirm({
    title: `Delete ${player.username}'s profile?`,
    message: 'Balance and statistics will be lost. A new profile with starting chips is created on their next login.',
    confirmLabel: 'Delete profile'
  })
  if (ok) withBusy(player.$id, () => deleteProfile(player.$id), 'Profile deleted.')
}
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>Players</h1>
        <p>Adjust balances or remove player profiles. Admin only.</p>
      </div>
    </header>

    <div class="toolbar">
      <label class="sr-only" for="player-search">Search players</label>
      <input id="player-search" v-model="search" type="search" placeholder="Username starts with…" />
    </div>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState v-else-if="!players.length" icon="users" title="No players found" />
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Username</th>
            <th scope="col">Balance</th>
            <th scope="col">Rounds</th>
            <th scope="col">Wagered</th>
            <th scope="col">Won</th>
            <th scope="col">Joined</th>
            <th scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <PlayerRow
            v-for="player in players"
            :key="player.$id"
            :player="player"
            :busy="busyId === player.$id"
            @save="save"
            @delete="remove"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.toolbar input {
  max-width: 320px;
}
</style>
