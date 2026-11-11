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
    <span class="ribbon" aria-hidden="true">🎁</span>
    <p class="bonus"><span class="gold-text">+{{ formatChips(promotion.bonusAmount) }}</span> <span class="unit">chips</span></p>
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
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background:
    radial-gradient(400px 160px at 100% 0%, rgb(236 72 153 / 0.22), transparent 70%),
    radial-gradient(300px 160px at 0% 0%, rgb(139 92 246 / 0.25), transparent 70%),
    var(--surface);
  border-color: var(--border-strong);
  transition: transform 0.2s, border-color 0.2s;
}
.promo:hover {
  transform: translateY(-4px);
  border-color: rgb(242 185 56 / 0.6);
}
.ribbon {
  position: absolute;
  top: 1rem;
  right: 1.1rem;
  font-size: 2.2rem;
  filter: drop-shadow(0 6px 10px rgb(0 0 0 / 0.4));
}
.bonus {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1.1;
}
.unit {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
}
h3 {
  margin: 0;
  font-size: 1.3rem;
}
p {
  margin: 0;
}
.dates {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.9rem;
  flex: 1;
}
</style>
