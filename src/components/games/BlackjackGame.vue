<script setup>
import { ref, computed } from 'vue'
import { useBet } from '@/composables/useBet'
import { useProfileStore } from '@/stores/profile'
import { createDeck, shuffle, handValue, isBlackjack, isBust, playDealer, settleHands } from '@/games/blackjack'
import { calcPayout } from '@/games/payout'
import { sleep } from '@/lib/sleep'
import BetInput from './BetInput.vue'
import RoundResult from './RoundResult.vue'
import PlayingCard from './PlayingCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ game: { type: Object, required: true } })

const profileStore = useProfileStore()
const { amount, stake, busy, inRound, canBet, validationError, lastResult, startRound, settleRound } = useBet(
  () => props.game
)

const deck = ref([])
const player = ref([])
const dealer = ref([])
const revealDealer = ref(false)

const playerTotal = computed(() => handValue(player.value))
const dealerTotal = computed(() => (revealDealer.value ? handValue(dealer.value) : handValue(dealer.value.slice(0, 1))))
const canAct = computed(() => inRound.value && !busy.value && !revealDealer.value)

const draw = () => deck.value.pop()

async function deal() {
  if (!(await startRound())) return
  revealDealer.value = false
  deck.value = shuffle(createDeck())
  player.value = [draw(), draw()]
  dealer.value = [draw(), draw()]
  if (isBlackjack(player.value)) await finish()
}

async function hit() {
  player.value.push(draw())
  if (isBust(player.value)) await finish()
}

async function finish() {
  revealDealer.value = true
  // The dealer only draws when the player is still in the game
  if (!isBust(player.value) && !isBlackjack(player.value)) {
    await sleep(500)
    const result = playDealer(dealer.value, deck.value)
    dealer.value = result.dealer
    deck.value = result.deck
  }
  await sleep(400)
  const { result, multiplier } = settleHands(player.value, dealer.value)
  const payout = calcPayout(stake.value, multiplier)
  await settleRound(payout, `${result.toUpperCase()} – you ${playerTotal.value}, dealer ${handValue(dealer.value)}`)
}
</script>

<template>
  <div class="game-layout">
    <section class="game-stage felt" aria-label="Blackjack table">
      <div class="hand">
        <h3>Dealer <span v-if="dealer.length" class="total">{{ dealerTotal }}</span></h3>
        <div class="cards">
          <PlayingCard v-for="(card, i) in dealer" :key="i" :card="card" :hidden="i === 1 && !revealDealer" />
          <p v-if="!dealer.length" class="muted">Place a bet and press Deal</p>
        </div>
      </div>
      <div class="hand">
        <h3>You <span v-if="player.length" class="total">{{ playerTotal }}</span></h3>
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
      <BaseButton v-if="!inRound" size="lg" :disabled="!canBet" :loading="busy" @click="deal">Deal</BaseButton>
      <div v-else class="actions">
        <BaseButton size="lg" :disabled="!canAct" @click="hit">Hit</BaseButton>
        <BaseButton size="lg" variant="secondary" :disabled="!canAct" @click="finish">Stand</BaseButton>
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
