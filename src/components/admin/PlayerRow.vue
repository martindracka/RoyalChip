<script setup>
import { ref, reactive } from 'vue'
import { formatChips, formatDate } from '@/lib/format'
import BaseButton from '@/components/ui/BaseButton.vue'

// One table row that can switch into "edit" mode.
const props = defineProps({
  player: { type: Object, required: true },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits(['save', 'delete'])

const editing = ref(false)
const form = reactive({ username: '', balance: 0 })
const error = ref('')

function startEdit() {
  Object.assign(form, { username: props.player.username, balance: props.player.balance })
  error.value = ''
  editing.value = true
}

function save() {
  if (form.username.trim().length < 3) return (error.value = 'Username needs 3+ characters')
  if (!Number.isInteger(form.balance) || form.balance < 0) return (error.value = 'Balance must be a whole number ≥ 0')
  emit('save', props.player, { username: form.username.trim(), balance: form.balance })
  editing.value = false
}
</script>

<template>
  <tr>
    <template v-if="editing">
      <td>
        <label class="sr-only" :for="`u-${player.$id}`">Username</label>
        <input :id="`u-${player.$id}`" v-model="form.username" />
      </td>
      <td>
        <label class="sr-only" :for="`b-${player.$id}`">Balance</label>
        <input :id="`b-${player.$id}`" v-model.number="form.balance" type="number" min="0" />
        <p v-if="error" class="negative" role="alert">{{ error }}</p>
      </td>
    </template>
    <template v-else>
      <td><strong>{{ player.username }}</strong></td>
      <td>{{ formatChips(player.balance) }}</td>
    </template>
    <td>{{ formatChips(player.gamesPlayed) }}</td>
    <td>{{ formatChips(player.totalWagered) }}</td>
    <td>{{ formatChips(player.totalWon) }}</td>
    <td>{{ formatDate(player.$createdAt) }}</td>
    <td class="actions">
      <template v-if="editing">
        <BaseButton size="sm" @click="save">Save</BaseButton>
        <BaseButton size="sm" variant="ghost" @click="editing = false">Cancel</BaseButton>
      </template>
      <template v-else>
        <BaseButton size="sm" variant="secondary" :loading="busy" @click="startEdit">Edit</BaseButton>
        <BaseButton size="sm" variant="danger" :disabled="busy" @click="emit('delete', player)">Delete</BaseButton>
      </template>
    </td>
  </tr>
</template>

<style scoped>
input {
  min-width: 120px;
  padding: 0.35rem 0.5rem;
}
p {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  white-space: normal;
}
</style>
