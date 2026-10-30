<script setup>
import { formatChips, formatDate, gameTypeInfo } from '@/lib/format'

// Reused on the profile page and in the admin bet log (with extra columns via props/slot).
defineProps({
  bets: { type: Array, required: true },
  showPlayer: { type: Boolean, default: false }
})
</script>

<template>
  <div class="table-wrap">
    <table>
      <caption class="sr-only">Bet history</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th v-if="showPlayer" scope="col">Player</th>
          <th scope="col">Game</th>
          <th scope="col">Bet</th>
          <th scope="col">Payout</th>
          <th scope="col">Result</th>
          <th v-if="$slots.actions" scope="col"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bet in bets" :key="bet.$id">
          <td>{{ formatDate(bet.$createdAt) }}</td>
          <td v-if="showPlayer">{{ bet.username }}</td>
          <td>{{ gameTypeInfo(bet.gameType).icon }} {{ bet.gameName }}</td>
          <td>{{ formatChips(bet.amount) }}</td>
          <td :class="bet.payout > bet.amount ? 'positive' : bet.payout < bet.amount ? 'negative' : ''">
            {{ formatChips(bet.payout) }}
          </td>
          <td class="outcome">{{ bet.outcome }}</td>
          <td v-if="$slots.actions" class="actions"><slot name="actions" :bet="bet" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.outcome {
  white-space: normal;
  min-width: 220px;
  color: var(--text-muted);
}
</style>
