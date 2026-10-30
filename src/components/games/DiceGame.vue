<script setup>
import { ref, computed } from 'vue'
import { useBet } from '@/composables/useBet'
import { useProfileStore } from '@/stores/profile'
import { rollDice, winChance, diceMultiplier, diceWins } from '@/games/dice'
import { calcPayout } from '@/games/payout'
import BetInput from './BetInput.vue'
import RoundResult from './RoundResult.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ game: { type: Object, required: true } })

const profileStore = useProfileStore()
const { amount, stake, busy, inRound, canBet, validationError, lastResult, startRound, settleRound } = useBet(
  () => props.game
)

const target = ref(50)
const direction = ref('over')
const shown = ref(null)
const won = ref(null)

const chance = computed(() => winChance(target.value, direction.value))
const multiplier = computed(() => diceMultiplier(target.value, direction.value))

// Counts quickly through random numbers before landing on the real roll.
function animateRoll(finalValue) {
  return new Promise((resolve) => {
    let ticks = 0
    const timer = setInterval(() => {
      shown.value = Math.floor(Math.random() * 100) + 1 // only visual, not the result
      if (++ticks >= 15) {
        clearInterval(timer)
        shown.value = finalValue
        resolve()
      }
    }, 60)
  })
}

async function roll() {
  if (!(await startRound())) return
  won.value = null
  const value = rollDice()
  await animateRoll(value)
  won.value = diceWins(value, target.value, direction.value)
  const payout = won.value ? calcPayout(stake.value, multiplier.value) : 0
  await settleRound(payout, `Rolled ${value} – needed ${direction.value} ${target.value}`)
}
</script>

<template>
  <div class="game-layout">
    <section class="game-stage dice-stage" aria-label="Dice">
      <div class="number" :class="{ win: won === true, lose: won === false }" aria-live="polite">
        {{ shown ?? '?' }}
      </div>
      <div class="bar" aria-hidden="true">
        <div
          class="zone"
          :style="direction === 'over' ? { left: `${target}%`, right: 0 } : { left: 0, right: `${101 - target}%` }"
        ></div>
        <div v-if="shown" class="marker" :style="{ left: `${shown}%` }"></div>
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

      <div class="toggle" role="radiogroup" aria-label="Roll direction">
        <button
          v-for="d in ['under', 'over']"
          :key="d"
          type="button"
          role="radio"
          :aria-checked="direction === d"
          :class="{ active: direction === d }"
          :disabled="inRound"
          @click="direction = d"
        >
          Roll {{ d }}
        </button>
      </div>

      <div>
        <label for="target">Target: <strong>{{ target }}</strong></label>
        <input id="target" v-model.number="target" type="range" min="2" max="98" :disabled="inRound" />
      </div>

      <dl class="stats">
        <div><dt>Win chance</dt><dd>{{ chance }}%</dd></div>
        <div><dt>Multiplier</dt><dd>{{ multiplier }}×</dd></div>
      </dl>

      <BaseButton size="lg" :disabled="!canBet" :loading="busy" @click="roll">Roll</BaseButton>
    </aside>
  </div>
</template>

<style scoped>
.dice-stage {
  background: radial-gradient(circle, #1f4e8b, #08162b);
}
.number {
  font-size: clamp(4rem, 14vw, 7rem);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-display);
  transition: color 0.2s;
}
.win {
  color: #5fd39b;
}
.lose {
  color: #ff7b7f;
}
.bar {
  position: relative;
  width: 100%;
  max-width: 480px;
  height: 14px;
  background: var(--red);
  border-radius: 999px;
}
.zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--green);
  border-radius: 999px;
}
.marker {
  position: absolute;
  top: -8px;
  width: 6px;
  height: 30px;
  margin-left: -3px;
  background: #fff;
  border-radius: 3px;
  transition: left 0.06s;
}
.toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.toggle button {
  padding: 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.toggle button.active {
  outline: 2px solid var(--gold);
}
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0;
}
.stats div {
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
}
dt {
  color: var(--text-muted);
  font-size: 0.8rem;
}
dd {
  margin: 0;
  font-weight: 700;
  font-size: 1.2rem;
}
</style>
