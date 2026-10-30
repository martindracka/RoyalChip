<script setup>
defineProps({ message: { type: String, required: true } })
defineEmits(['retry'])
</script>

<template>
  <div class="error-box" role="alert">
    <span aria-hidden="true">⚠️</span>
    <div>
      <strong>Something went wrong</strong>
      <p>{{ message }}</p>
    </div>
    <button class="retry" type="button" @click="$emit('retry')">Try again</button>
  </div>
</template>

<style scoped>
.error-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--red);
  background: rgb(229 72 77 / 0.1);
  border-radius: var(--radius);
}
.error-box div {
  flex: 1;
}
p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
}
.retry {
  background: transparent;
  border: 1px solid var(--red);
  color: var(--text);
  border-radius: 999px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  font: inherit;
}
</style>
