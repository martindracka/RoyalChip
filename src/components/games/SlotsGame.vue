<script setup>
import { ref } from 'vue'
import { useBet } from '@/composables/useBet'
import { useProfileStore } from '@/stores/profile'
import { SYMBOLS, spinReels, randomSymbol, slotsMultiplier } from '@/games/slots'
import { calcPayout } from '@/games/payout'
import BetInput from './BetInput.vue'
import SlotSymbol from './SlotSymbol.vue'
import RoundResult from './RoundResult.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ game: { type: Object, required: true } })

const profileStore = useProfileStore()
const { amount, stake, busy, inRound, canBet, validationError, lastResult, startRound, settleRound } = useBet(
  () => props.game
)

const reels = ref(['cherry', 'bell', 'gem'])
const spinning = ref([false, false, false])

// Each reel shows random symbols for a while and then stops on its final symbol.
function animateReel(index, finalSymbol, duration) {
  spinning.value[index] = true
  return new Promise((resolve) => {
    const timer = setInterval(() => (reels.value[index] = randomSymbol()), 70)
    setTimeout(() => {
      clearInterval(timer)
      reels.value[index] = finalSymbol
      spinning.value[index] = false
      resolve()
    }, duration)
  })
}

async function spin() {
  if (!(await startRound())) return
  const result = spinReels() // the result is decided BEFORE the animation
  await Promise.all(result.map((symbol, i) => animateReel(i, symbol, 700 + i * 350)))
  const payout = calcPayout(stake.value, slotsMultiplier(result))
  await settleRound(payout, result.join(' '))
}
</script>

<template>
  <div class="game-layout">
    <section class="game-stage slots-stage" aria-label="Slot machine">
      <div class="machine">
        <div v-for="(symbol, i) in reels" :key="i" class="reel" :class="{ spinning: spinning[i] }">
          <span :aria-label="`Reel ${i + 1}: ${symbol}`"><SlotSymbol :symbol="symbol" :size="72" /></span>
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
      <BaseButton size="lg" :disabled="!canBet" :loading="busy" @click="spin">
        {{ inRound ? 'Spinning…' : 'Spin' }}
      </BaseButton>

      <h3>Paytable</h3>
      <ul class="paytable">
        <li v-for="s in SYMBOLS" :key="s.icon">
          <span class="combo"><SlotSymbol v-for="n in 3" :key="n" :symbol="s.icon" :size="20" /></span><strong>{{ s.multiplier }}×</strong>
        </li>
        <li>
          <span class="combo"><SlotSymbol v-for="n in 2" :key="n" symbol="cherry" :size="20" /> <small class="muted">any two</small></span
          ><strong>2×</strong>
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.slots-stage {
  background: radial-gradient(circle, #5a1745, #1e0717);
}
.machine {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem;
  background: linear-gradient(180deg, #e3b341, #8a6414);
  border-radius: 20px;
  box-shadow: inset 0 0 0 4px #fff3, var(--shadow);
}
.reel {
  width: clamp(80px, 18vw, 130px);
  height: clamp(100px, 22vw, 160px);
  display: grid;
  place-items: center;
  font-size: clamp(2.8rem, 8vw, 4.5rem);
  background: linear-gradient(180deg, #ddd, #fff 30%, #fff 70%, #ccc);
  border-radius: 12px;
  overflow: hidden;
}
.reel.spinning span {
  filter: blur(2px);
  animation: shake 0.1s linear infinite;
}
@keyframes shake {
  50% {
    transform: translateY(6px);
  }
}
.paytable {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.95rem;
}
.combo {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.paytable li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px dashed var(--border);
}
</style>
