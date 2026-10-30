<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | danger | ghost
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
  size: { type: String, default: 'md' } // sm | md | lg
})
</script>

<template>
  <RouterLink v-if="to" :to="to" class="btn" :class="[variant, size]">
    <slot />
  </RouterLink>
  <button
    v-else
    :type="type"
    class="btn"
    :class="[variant, size]"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.1s, filter 0.15s, background 0.15s;
  white-space: nowrap;
}
.btn:hover:not(:disabled) {
  filter: brightness(1.1);
}
.btn:active:not(:disabled) {
  transform: scale(0.97);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sm {
  padding: 0.35rem 0.85rem;
  font-size: 0.85rem;
}
.md {
  padding: 0.6rem 1.25rem;
}
.lg {
  padding: 0.85rem 2rem;
  font-size: 1.1rem;
}
.primary {
  background: linear-gradient(180deg, var(--gold-strong), var(--gold));
  color: #1a1200;
}
.secondary {
  background: var(--surface-2);
  border-color: var(--border);
  color: var(--text);
}
.danger {
  background: var(--red);
  color: #fff;
}
.ghost {
  background: transparent;
  color: var(--text);
  border-color: var(--border);
}
.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
