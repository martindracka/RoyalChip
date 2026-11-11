<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: '' }
})
</script>

<template>
  <div class="stat card">
    <span class="icon" aria-hidden="true"><AppIcon :name="icon" :size="24" /></span>
    <div>
      <p class="label">{{ label }}</p>
      <p class="value">{{ value }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
}
.icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  color: var(--gold);
  background: linear-gradient(135deg, rgb(242 185 56 / 0.18), rgb(242 185 56 / 0.04));
  border: 1px solid rgb(242 185 56 / 0.25);
}
.label {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}
.value {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-display);
}
</style>
