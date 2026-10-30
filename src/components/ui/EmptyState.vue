<script setup>
defineProps({
  icon: { type: String, default: '🃏' },
  title: { type: String, default: 'Nothing here yet' },
  message: { type: String, default: '' }
})
</script>

<template>
  <div class="empty">
    <div class="icon" aria-hidden="true">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p v-if="message" class="muted">{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 3rem 1rem;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
}
.icon {
  font-size: 3rem;
}
</style>
