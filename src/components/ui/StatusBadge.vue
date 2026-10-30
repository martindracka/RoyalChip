<script setup>
defineProps({
  tone: { type: String, default: 'neutral' }, // success | danger | warning | neutral
  label: { type: String, required: true }
})
</script>

<template>
  <span class="badge" :class="tone">{{ label }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--surface-2);
  color: var(--text-muted);
}
.success {
  background: rgb(48 164 108 / 0.2);
  color: #5fd39b;
}
.danger {
  background: rgb(229 72 77 / 0.2);
  color: #ff7b7f;
}
.warning {
  background: rgb(227 179 65 / 0.2);
  color: var(--gold-strong);
}
</style>
