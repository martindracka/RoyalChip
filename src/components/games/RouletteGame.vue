<script setup>
import { ref, computed } from 'vue'
import { useBet } from '@/composables/useBet'
import { useProfileStore } from '@/stores/profile'
import { BET_TYPES, WHEEL_ORDER, numberColor } from '@shared/games/roulette.js'
import { casino } from '@/services/casinoApi'
import { sleep } from '@/lib/sleep'
import BetInput from './BetInput.vue'
import RoundResult from './RoundResult.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ game: { type: Object, required: true } })

const profileStore = useProfileStore()
const { amount, busy, inRound, canBet, validationError, lastResult, placeBet, finishRound } = useBet(
  () => props.game
)

const betType = ref('red')
const pick = ref(7)
const rotation = ref(0)
const lastNumber = ref(null)
const history = ref([])

const SEGMENT = 360 / WHEEL_ORDER.length
const COLORS = { red: '#c62828', black: '#1b1b1b', green: '#1b7a3e' }

// Build the wheel background from the real number order.
const wheelStyle = computed(() => {
  const stops = WHEEL_ORDER.map((n, i) => `${COLORS[numberColor(n)]} ${i * SEGMENT}deg ${(i + 1) * SEGMENT}deg`)
  return { background: `conic-gradient(${stops.join(',')})`, transform: `rotate(${rotation.value}deg)` }
})

const pickValid = computed(() => betType.value !== 'straight' || (Number.isInteger(pick.value) && pick.value >= 0 && pick.value <= 36))

async function spin() {
  if (!pickValid.value) return
  const choices = { betType: betType.value, pick: betType.value === 'straight' ? pick.value : null }
  const res = await placeBet((stake) => casino.play(props.game.$id, stake, choices))
  if (!res) return
  const result = res.number
  // Rotate so the winning segment ends under the pointer at the top (+ 5 full turns).
  const index = WHEEL_ORDER.indexOf(result)
  const target = 360 - (index * SEGMENT + SEGMENT / 2)
  rotation.value += 360 * 5 + ((target - (rotation.value % 360) + 360) % 360)
  await sleep(4000)

  lastNumber.value = result
  history.value = [result, ...history.value].slice(0, 10)
  finishRound(res)
}
</script>

<template>
  <div class="game-layout">
    <section class="game-stage roulette-stage" aria-label="Roulette wheel">
      <div class="wheel-wrap">
        <div class="pointer" aria-hidden="true">▼</div>
        <div class="wheel" :style="wheelStyle" aria-hidden="true">
          <span
            v-for="(n, i) in WHEEL_ORDER"
            :key="n"
            class="num"
            :style="{ transform: `rotate(${i * SEGMENT + SEGMENT / 2}deg) translateY(-118px)` }"
            >{{ n }}</span
          >
          <div class="hub"></div>
        </div>
      </div>
      <p v-if="lastNumber !== null" class="last" :class="numberColor(lastNumber)" aria-live="polite">
        {{ lastNumber }}
      </p>
      <div v-if="history.length" class="history" aria-label="Last results">
        <span v-for="(n, i) in history" :key="i" :class="numberColor(n)">{{ n }}</span>
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

      <fieldset :disabled="inRound">
        <legend>Bet on</legend>
        <div class="bet-types">
          <label v-for="(bet, key) in BET_TYPES" :key="key" class="bet-type" :class="[key, { active: betType === key }]">
            <input v-model="betType" type="radio" name="bet-type" :value="key" class="sr-only" />
            {{ bet.label }} <small>{{ bet.payout }}×</small>
          </label>
        </div>
      </fieldset>

      <div v-if="betType === 'straight'">
        <label for="pick">Your number (0–36)</label>
        <input id="pick" v-model.number="pick" type="number" min="0" max="36" :disabled="inRound" />
        <p v-if="!pickValid" class="negative">Pick a number between 0 and 36</p>
      </div>

      <BaseButton size="lg" :disabled="!canBet || !pickValid" :loading="busy" @click="spin">
        {{ inRound ? 'Spinning…' : 'Spin the wheel' }}
      </BaseButton>
    </aside>
  </div>
</template>

<style scoped>
.roulette-stage {
  background: radial-gradient(circle, #0d5c3a, #04261a);
}
.wheel-wrap {
  position: relative;
}
.pointer {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--gold-strong);
  font-size: 1.6rem;
  z-index: 2;
  text-shadow: 0 2px 4px #000;
}
.wheel {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 10px solid #6b4416;
  box-shadow: 0 0 0 4px var(--gold), var(--shadow);
  transition: transform 4s cubic-bezier(0.15, 0.85, 0.25, 1);
}
.num {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  margin: -9px 0 0 -10px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
}
.hub {
  position: absolute;
  inset: 32%;
  border-radius: 50%;
  background: radial-gradient(circle, #e3b341, #6b4416);
}
.last {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0.5rem 0 0;
  width: 70px;
  height: 70px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}
.history {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}
.history span {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  font-weight: 700;
}
.red {
  background: #c62828;
}
.black {
  background: #1b1b1b;
}
.green {
  background: #1b7a3e;
}
fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}
legend {
  font-weight: 600;
  margin-bottom: 0.4rem;
}
.bet-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
}
.bet-type {
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  cursor: pointer;
  text-align: center;
  font-weight: 600;
}
.bet-type.red {
  background: #6d1515;
}
.bet-type.black {
  background: #111;
}
.bet-type small {
  color: var(--text-muted);
}
.bet-type.active {
  outline: 2px solid var(--gold);
}
.bet-type:focus-within {
  outline: 3px solid var(--gold-strong);
}
</style>
