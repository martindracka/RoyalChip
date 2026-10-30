<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
const icons = { success: '✅', error: '⛔', info: 'ℹ️' }
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="t.type"
        :role="t.type === 'error' ? 'alert' : 'status'"
      >
        <span aria-hidden="true">{{ icons[t.type] }}</span>
        <span class="msg">{{ t.message }}</span>
        <button type="button" aria-label="Close notification" @click="dismiss(t.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
  max-width: min(380px, calc(100vw - 2rem));
}
.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border-left: 4px solid var(--blue);
  box-shadow: var(--shadow);
}
.toast.success {
  border-left-color: var(--green);
}
.toast.error {
  border-left-color: var(--red);
}
.msg {
  flex: 1;
}
button {
  background: none;
  border: 0;
  color: var(--text-muted);
  font-size: 1.3rem;
  cursor: pointer;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
