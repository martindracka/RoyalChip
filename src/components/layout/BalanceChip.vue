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
  <div class="wallet">
    <span class="balance" :class="bump" aria-live="polite">
      <span class="coin" aria-hidden="true"></span>
      <span class="sr-only">Balance:</span>
      {{ formatChips(profileStore.balance) }}
    </span>
    <RouterLink to="/promotions" class="get-chips" title="Get bonus chips">
      <span aria-hidden="true">+</span><span class="sr-only">Get bonus chips</span>
    </RouterLink>
  </div>
</template>

<style scoped>
.wallet {
  display: inline-flex;
  align-items: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  padding: 0.2rem 0.2rem 0.2rem 0.75rem;
  gap: 0.6rem;
}
.balance {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--text);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: transform 0.2s, color 0.2s;
}
.coin {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--gold-gradient);
  box-shadow: inset 0 0 0 3px rgb(0 0 0 / 0.15), 0 0 10px rgb(242 185 56 / 0.5);
}
.get-chips {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--gold-gradient);
  color: #241600 !important;
  font-weight: 800;
  font-size: 1.2rem;
  line-height: 1;
  text-decoration: none;
  transition: transform 0.15s;
}
.get-chips:hover {
  transform: scale(1.08);
}
.up {
  transform: scale(1.12);
  color: var(--green);
}
.down {
  transform: scale(0.95);
}
</style>
