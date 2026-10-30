<script setup>
defineProps({ message: { type: String, default: 'Loading…' } })
</script>

<template>
  <div class="loading" role="status" aria-live="polite">
    <div class="chip" aria-hidden="true"></div>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.loading {
  display: grid;
  place-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: var(--text-muted);
}
.chip {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 6px dashed var(--gold);
  animation: spin 1.2s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
