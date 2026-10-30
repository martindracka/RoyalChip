<script setup>
import { ref, watch, nextTick } from 'vue'
import { useConfirm } from '@/composables/useConfirm'
import BaseButton from './BaseButton.vue'

const { state, answer } = useConfirm()
const dialog = ref(null)

// The native <dialog> element handles focus trapping and the Escape key for us.
watch(
  () => state.open,
  async (open) => {
    await nextTick()
    if (open) dialog.value?.showModal()
    else dialog.value?.close()
  }
)
</script>

<template>
  <dialog ref="dialog" class="dialog" aria-labelledby="confirm-title" @cancel.prevent="answer(false)">
    <h2 id="confirm-title">{{ state.title }}</h2>
    <p class="muted">{{ state.message }}</p>
    <div class="form-actions">
      <BaseButton variant="secondary" @click="answer(false)">Cancel</BaseButton>
      <BaseButton variant="danger" @click="answer(true)">{{ state.confirmLabel }}</BaseButton>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  padding: 1.5rem;
  width: min(420px, calc(100vw - 2rem));
}
.dialog::backdrop {
  background: rgb(0 0 0 / 0.6);
}
</style>
