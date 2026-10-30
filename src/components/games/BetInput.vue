<script setup>
// Bet amount input with quick buttons. Used by every game.
const amount = defineModel({ type: Number, required: true })

const props = defineProps({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  balance: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const clamp = (v) => Math.max(props.min, Math.min(props.max, Math.floor(v)))

function setAmount(value) {
  amount.value = clamp(value)
}
</script>

<template>
  <div class="bet-input">
    <label for="bet-amount">Your bet</label>
    <div class="row">
      <button type="button" :disabled="disabled" aria-label="Halve the bet" @click="setAmount(amount / 2)">½</button>
      <input
        id="bet-amount"
        v-model.number="amount"
        type="number"
        :min="min"
        :max="max"
        step="1"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        aria-describedby="bet-help"
      />
      <button type="button" :disabled="disabled" aria-label="Double the bet" @click="setAmount(amount * 2)">2×</button>
      <button type="button" :disabled="disabled" @click="setAmount(min)">Min</button>
      <button type="button" :disabled="disabled" @click="setAmount(Math.min(max, balance))">Max</button>
    </div>
    <p id="bet-help" class="help" :class="{ error }">
      {{ error || `Limits: ${min} – ${max} chips` }}
    </p>
  </div>
</template>

<style scoped>
.bet-input label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.4rem;
}
.row {
  display: flex;
  gap: 0.4rem;
}
input {
  flex: 1;
  min-width: 80px;
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
}
button {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 0 0.75rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.help {
  margin: 0.4rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.help.error {
  color: var(--red);
}
</style>
