<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, default: 'spade' },
  title: { type: String, default: 'Nothing here yet' },
  message: { type: String, default: '' }
})
</script>

<template>
  <div class="empty">
    <div class="icon" aria-hidden="true"><AppIcon :name="icon" :size="30" :stroke-width="1.75" /></div>
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
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: var(--gold);
  background: rgb(242 185 56 / 0.1);
  border: 1px solid rgb(242 185 56 / 0.25);
}
</style>
