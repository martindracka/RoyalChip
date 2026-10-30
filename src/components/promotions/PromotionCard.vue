<script setup>
import { formatChips, formatDate } from '@/lib/format'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps({
  promotion: { type: Object, required: true },
  claimed: { type: Boolean, default: false },
  claiming: { type: Boolean, default: false },
  canClaim: { type: Boolean, default: false }
})
defineEmits(['claim'])
</script>

<template>
  <article class="promo card">
    <p class="bonus">+{{ formatChips(promotion.bonusAmount) }} <span>chips</span></p>
    <h3>{{ promotion.title }}</h3>
    <p class="muted">{{ promotion.description }}</p>
    <p class="dates">Valid until {{ formatDate(promotion.endsAt) }}</p>
    <slot name="action">
      <BaseButton v-if="!canClaim" variant="secondary" to="/login">Log in to claim</BaseButton>
      <BaseButton v-else-if="claimed" variant="secondary" disabled>✔ Claimed</BaseButton>
      <BaseButton v-else :loading="claiming" @click="$emit('claim', promotion)">Claim bonus</BaseButton>
    </slot>
  </article>
</template>

<style scoped>
.promo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: linear-gradient(160deg, #1d4635, var(--surface));
  border-color: #3d6e57;
}
.bonus {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gold-strong);
}
.bonus span {
  font-size: 1rem;
  color: var(--text-muted);
}
h3 {
  margin: 0;
}
p {
  margin: 0;
}
.dates {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  flex: 1;
}
</style>
