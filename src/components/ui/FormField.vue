<script setup>
// Wraps an input with a label and an error message and links them for screen readers.
// The slot receives `describedby` so the input can point at the error/hint text.
defineProps({
  label: { type: String, required: true },
  id: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' }
})
</script>

<template>
  <div class="field" :class="{ invalid: error }">
    <label :for="id">{{ label }}</label>
    <slot :describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined" :invalid="Boolean(error)" />
    <p v-if="error" :id="`${id}-error`" class="error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
label {
  font-weight: 600;
  font-size: 0.9rem;
}
.invalid :slotted(input),
.invalid :slotted(select),
.invalid :slotted(textarea) {
  border-color: var(--red);
}
.error {
  color: var(--red);
  font-size: 0.85rem;
  margin: 0;
}
.hint {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}
</style>
