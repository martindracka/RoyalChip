<script setup>
import { ref, watch } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { formatChips } from '@/lib/format'

const profileStore = useProfileStore()
const bump = ref('')

// Small animation whenever the balance goes up or down.
watch(
  () => profileStore.balance,
  (now, before) => {
    bump.value = now > before ? 'up' : 'down'
    setTimeout(() => (bump.value = ''), 600)
  }
)
</script>

<template>
  <span class="balance" :class="bump" aria-live="polite">
    <span aria-hidden="true">🪙</span>
    <span class="sr-only">Balance:</span>
    {{ formatChips(profileStore.balance) }}
  </span>
</template>

<style scoped>
.balance {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--surface-2);
  border: 1px solid var(--gold);
  color: var(--gold-strong);
  border-radius: 999px;
  padding: 0.3rem 0.9rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: transform 0.2s;
}
.up {
  transform: scale(1.12);
  color: #5fd39b;
}
.down {
  transform: scale(0.95);
}
</style>
