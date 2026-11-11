<script setup>
import { ref } from 'vue'
import { useBet } from '@/composables/useBet'
import { useProfileStore } from '@/stores/profile'
import { flipCoin, COINFLIP_MULTIPLIER } from '@/games/coinflip'
import { calcPayout } from '@/games/payout'
import { sleep } from '@/lib/sleep'
import BetInput from './BetInput.vue'
import RoundResult from './RoundResult.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({ game: { type: Object, required: true } })

const profileStore = useProfileStore()
const { amount, stake, busy, inRound, canBet, validationError, lastResult, startRound, settleRound } = useBet(
  () => props.game
)

const choice = ref('heads')
const rotation = ref(0)

async function flip() {
  if (!(await startRound())) return
  const side = flipCoin()
  // heads = front (0°), tails = back (180°); add several full turns for the animation
  const current = rotation.value % 360
  const wanted = side === 'heads' ? 0 : 180
  rotation.value += 360 * 5 + ((wanted - current + 360) % 360)
  await sleep(2000)
  const payout = side === choice.value ? calcPayout(stake.value, COINFLIP_MULTIPLIER) : 0
  await settleRound(payout, `Coin landed on ${side} – you picked ${choice.value}`)
}
</script>

<template>
  <div class="game-layout">
    <section class="game-stage coin-stage" aria-label="Coin">
      <div class="coin" :style="{ transform: `rotateY(${rotation}deg)` }" aria-hidden="true">
        <div class="face front"><AppIcon name="crown" :size="84" :stroke-width="1.5" /></div>
        <div class="face back"><AppIcon name="bird" :size="84" :stroke-width="1.5" /></div>
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
      <div class="choices" role="radiogroup" aria-label="Pick a side">
        <button
          v-for="side in ['heads', 'tails']"
          :key="side"
          type="button"
          role="radio"
          :aria-checked="choice === side"
          :class="{ active: choice === side }"
          :disabled="inRound"
          @click="choice = side"
        >
          <AppIcon :name="side === 'heads' ? 'crown' : 'bird'" :size="18" />
          {{ side === 'heads' ? 'Heads' : 'Tails' }}
        </button>
      </div>
      <p class="muted">A correct guess pays {{ COINFLIP_MULTIPLIER }}×.</p>
      <BaseButton size="lg" :disabled="!canBet" :loading="busy" @click="flip">Flip the coin</BaseButton>
    </aside>
  </div>
</template>

<style scoped>
.coin-stage {
  background: radial-gradient(circle, #6b521a, #1f1706);
  perspective: 800px;
}
.coin {
  position: relative;
  width: 180px;
  height: 180px;
  transform-style: preserve-3d;
  transition: transform 2s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.face {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #7a5408;
  backface-visibility: hidden;
  background: radial-gradient(circle at 30% 30%, #ffe08a, #c08b17);
  border: 8px solid #a37512;
  box-shadow: inset 0 0 0 4px #ffe9a8;
}
.back {
  transform: rotateY(180deg);
}
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.choices button {
  padding: 0.7rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.choices button.active {
  outline: 2px solid var(--gold);
}
</style>
