<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useAsync } from '@/composables/useAsync'
import { useToast } from '@/composables/useToast'
import { useForm, required, minLength, maxLength } from '@/composables/useForm'
import { listMyBets } from '@/services/betService'
import { STARTING_BALANCE } from '@/services/profileService'
import { formatChips } from '@/lib/format'
import { toMessage } from '@/lib/errors'
import StatCard from '@/components/ui/StatCard.vue'
import FormField from '@/components/ui/FormField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BetHistoryTable from '@/components/profile/BetHistoryTable.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const auth = useAuthStore()
const profileStore = useProfileStore()
const toast = useToast()
const profile = computed(() => profileStore.profile)

const bets = useAsync(() => listMyBets(auth.user.$id), { initialData: [] })

const { values, errors, submitting, handleSubmit, validateField } = useForm(
  { username: profile.value?.username ?? '' },
  { username: [required(), minLength(3), maxLength(30)] }
)

const net = computed(() => (profile.value ? profile.value.totalWon - profile.value.totalWagered : 0))
const canRefill = computed(() => profileStore.balance < 10)

const saveUsername = () =>
  handleSubmit(async ({ username }) => {
    try {
      await profileStore.save({ username: username.trim() })
      toast.success('Username updated.')
    } catch (e) {
      toast.error(toMessage(e))
    }
  })

async function refill() {
  try {
    await profileStore.save({ balance: STARTING_BALANCE })
    toast.success(`Your balance was refilled to ${formatChips(STARTING_BALANCE)} chips.`)
  } catch (e) {
    toast.error(toMessage(e))
  }
}
</script>

<template>
  <div v-if="profile" class="profile">
    <header class="page-header">
      <div>
        <h1>Hi, {{ profile.username }} 👋</h1>
        <p>{{ auth.user.email }} · <StatusBadge :label="auth.role" tone="warning" /></p>
      </div>
    </header>

    <section class="stats">
      <StatCard icon="🪙" label="Balance" :value="formatChips(profile.balance)" />
      <StatCard icon="🎯" label="Rounds played" :value="formatChips(profile.gamesPlayed)" />
      <StatCard icon="💸" label="Total wagered" :value="formatChips(profile.totalWagered)" />
      <StatCard icon="📈" label="Net result" :value="(net >= 0 ? '+' : '') + formatChips(net)" />
    </section>

    <div class="columns">
      <form class="card" novalidate @submit.prevent="saveUsername">
        <h2>Edit profile</h2>
        <FormField id="username" label="Username" :error="errors.username">
          <template #default="{ describedby }">
            <input
              id="username"
              v-model="values.username"
              autocomplete="nickname"
              :aria-describedby="describedby"
              @blur="validateField('username')"
            />
          </template>
        </FormField>
        <div class="form-actions">
          <BaseButton type="submit" :loading="submitting">Save</BaseButton>
        </div>
      </form>

      <div class="card">
        <h2>Out of chips?</h2>
        <p class="muted">When your balance drops below 10 chips you can refill it to {{ formatChips(STARTING_BALANCE) }}.</p>
        <BaseButton variant="secondary" :disabled="!canRefill" @click="refill">Refill balance</BaseButton>
      </div>
    </div>

    <section>
      <h2>Recent bets</h2>
      <LoadingState v-if="bets.loading.value" />
      <ErrorState v-else-if="bets.error.value" :message="bets.error.value" @retry="bets.run()" />
      <EmptyState v-else-if="!bets.data.value.length" icon="🎲" title="No bets yet" message="Your rounds will show up here.">
        <BaseButton to="/games">Play a game</BaseButton>
      </EmptyState>
      <BetHistoryTable v-else :bets="bets.data.value" />
    </section>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.stats {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.columns {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
</style>
