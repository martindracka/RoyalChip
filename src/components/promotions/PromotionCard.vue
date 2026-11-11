<script setup>
import { formatChips, formatDate } from '@/lib/format'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { photoUrl } from '@/lib/images'

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
    <div class="photo" aria-hidden="true">
      <img :src="photoUrl('chips', 800)" :srcset="`${photoUrl('chips', 800)} 800w, ${photoUrl('chips', 1600)} 1600w`" sizes="400px" alt="" loading="lazy" />
      <span class="ribbon"><AppIcon name="gift" :size="22" /></span>
    </div>
    <p class="bonus"><span class="gold-text">+{{ formatChips(promotion.bonusAmount) }}</span> <span class="unit">chips</span></p>
    <h3>{{ promotion.title }}</h3>
    <p class="muted">{{ promotion.description }}</p>
    <p class="dates"><AppIcon name="clock" :size="14" /> Valid until {{ formatDate(promotion.endsAt) }}</p>
    <slot name="action">
      <BaseButton v-if="!canClaim" variant="secondary" to="/login">Log in to claim</BaseButton>
      <BaseButton v-else-if="claimed" variant="secondary" disabled><AppIcon name="check" :size="16" /> Claimed</BaseButton>
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
  padding-top: 0;
  background: var(--surface);
  border-color: var(--border-strong);
  transition: transform 0.2s, border-color 0.2s;
}
.promo:hover {
  transform: translateY(-4px);
  border-color: rgb(242 185 56 / 0.6);
}
.photo {
  position: relative;
  height: 150px;
  margin: 0 -1.5rem 0.75rem;
}
.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, var(--surface), transparent 70%);
}
.ribbon {
  position: absolute;
  z-index: 1;
  top: 1rem;
  right: 1rem;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gold-gradient);
  color: #241600;
  box-shadow: var(--shadow-gold);
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
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.9rem;
  flex: 1;
}
</style>
