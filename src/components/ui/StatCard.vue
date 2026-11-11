<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: '' }
})
</script>

<template>
  <div class="stat card">
    <span class="icon" aria-hidden="true">{{ icon }}</span>
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
  font-size: 1.6rem;
  background: linear-gradient(135deg, rgb(139 92 246 / 0.35), rgb(236 72 153 / 0.2));
  border: 1px solid rgb(255 255 255 / 0.08);
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
