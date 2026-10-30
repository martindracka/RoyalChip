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
  font-size: 2rem;
}
.label {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}
.value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-display);
}
</style>
