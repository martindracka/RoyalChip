<script setup>
import { computed } from 'vue'
import { formatChips } from '@/lib/format'

const props = defineProps({ result: { type: Object, default: null } })

const tone = computed(() => {
  if (!props.result) return ''
  if (props.result.net > 0) return 'win'
  if (props.result.net === 0) return 'push'
  return 'lose'
})
</script>

<template>
  <div class="result-slot" aria-live="polite">
    <Transition name="pop">
      <div v-if="result" :key="result.outcome + result.payout" class="result" :class="tone">
        <strong v-if="tone === 'win'">You won {{ formatChips(result.payout) }} chips!</strong>
        <strong v-else-if="tone === 'push'">Push – your {{ formatChips(result.stake) }} chips are back</strong>
        <strong v-else>You lost {{ formatChips(result.stake) }} chips</strong>
        <span class="outcome">{{ result.outcome }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.result-slot {
  min-height: 72px;
}
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface-2);
  text-align: center;
}
.win {
  border-color: var(--green);
  background: rgb(48 164 108 / 0.15);
}
.lose {
  border-color: var(--red);
  background: rgb(229 72 77 / 0.12);
}
.outcome {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.pop-enter-active {
  animation: pop 0.35s ease;
}
@keyframes pop {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
