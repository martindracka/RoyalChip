<script setup>
import { ref, computed, watch } from 'vue'
import { useAsync } from '@/composables/useAsync'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { listAllBets, deleteBet, summarizeBets } from '@/services/betService'
import { GAME_TYPES, formatChips } from '@/lib/format'
import { toMessage } from '@/lib/errors'
import BetHistoryTable from '@/components/profile/BetHistoryTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const toast = useToast()
const { confirm } = useConfirm()
const gameType = ref('')

const { data: bets, loading, error, run } = useAsync(() => listAllBets({ gameType: gameType.value }), {
  initialData: []
})
watch(gameType, () => run())

const summary = computed(() => summarizeBets(bets.value))

async function remove(bet) {
  const ok = await confirm({ title: 'Delete this bet record?', message: 'Use this only to clean up test data.', confirmLabel: 'Delete' })
  if (!ok) return
  try {
    await deleteBet(bet.$id)
    toast.success('Bet record deleted.')
    await run()
  } catch (e) {
    toast.error(toMessage(e))
  }
}
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>Bet log</h1>
        <p>The latest 100 rounds from all players.</p>
      </div>
    </header>

    <div class="toolbar">
      <label class="sr-only" for="bet-type">Game type</label>
      <select id="bet-type" v-model="gameType">
        <option value="">All game types</option>
        <option v-for="t in GAME_TYPES" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
      </select>
      <p v-if="bets.length" class="muted summary">
        {{ summary.count }} rounds · wagered {{ formatChips(summary.wagered) }} · house profit
        <strong :class="summary.houseProfit >= 0 ? 'positive' : 'negative'">{{ formatChips(summary.houseProfit) }}</strong>
      </p>
    </div>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState v-else-if="!bets.length" icon="📜" title="No bets recorded" />
    <BetHistoryTable v-else :bets="bets" show-player>
      <template #actions="{ bet }">
        <BaseButton size="sm" variant="ghost" @click="remove(bet)">Delete</BaseButton>
      </template>
    </BetHistoryTable>
  </div>
</template>

<style scoped>
select {
  width: auto;
  min-width: 200px;
}
.summary {
  margin: 0;
  align-self: center;
}
</style>
