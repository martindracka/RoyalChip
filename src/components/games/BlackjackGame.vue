<script setup>
import { computed } from 'vue'
import { useBlackjack } from '@/composables/useBlackjack'
import { useProfileStore } from '@/stores/profile'
import BetInput from './BetInput.vue'
import RoundResult from './RoundResult.vue'
import PlayingCard from './PlayingCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ game: { type: Object, required: true } })

const profileStore = useProfileStore()
const { amount, round, busy, inRound, lastResult, validationError, canDeal, canAct, deal, hit, stand } = useBlackjack(
  () => props.game
)

const player = computed(() => round.value?.player ?? [])
// While playing, the server sends only the first dealer card – we draw a face-down card next to it.
const dealer = computed(() => {
  const cards = round.value?.dealer ?? []
  return round.value?.dealerHidden ? [...cards, null] : cards
})
</script>

<template>
  <div class="game-layout">
    <section class="game-stage felt" aria-label="Blackjack table">
      <div class="hand">
        <h3>Dealer <span v-if="dealer.length" class="total">{{ round.dealerTotal }}</span></h3>
        <div class="cards">
          <PlayingCard v-for="(card, i) in dealer" :key="i" :card="card" :hidden="card === null" />
          <p v-if="!dealer.length" class="muted">Place a bet and press Deal</p>
        </div>
      </div>
      <div class="hand">
        <h3>You <span v-if="player.length" class="total">{{ round.playerTotal }}</span></h3>
        <div class="cards">
          <PlayingCard v-for="(card, i) in player" :key="i" :card="card" />
        </div>
      </div>
      <RoundResult :result="lastResult" />
    </section>

    <aside class="game-controls card">
      <BetInput
        v-model="amount"
        :min="game.minBet"
        :max="game.maxBet"
        :balance="profileStore.balance"
        :disabled="inRound || busy"
        :error="validationError"
      />
      <BaseButton v-if="!inRound" size="lg" :disabled="!canDeal" :loading="busy" @click="deal">Deal</BaseButton>
      <div v-else class="actions">
        <BaseButton size="lg" :disabled="!canAct" @click="hit">Hit</BaseButton>
        <BaseButton size="lg" variant="secondary" :disabled="!canAct" @click="stand">Stand</BaseButton>
      </div>
      <p class="muted rules">
        Blackjack pays 3:2, a win pays 1:1, a tie returns your bet. Dealer stands on 17.
      </p>
    </aside>
  </div>
</template>

<style scoped>
.felt {
  background: radial-gradient(ellipse at center, #11744a, #063522);
  justify-content: space-around;
}
.hand {
  width: 100%;
  text-align: center;
}
.cards {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  min-height: 112px;
  align-items: center;
}
.total {
  display: inline-block;
  min-width: 2rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.4);
  font-family: var(--font);
  font-size: 1rem;
}
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.rules {
  font-size: 0.9rem;
}
</style>
