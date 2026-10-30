import { reactive } from 'vue'

// Promise-based confirm dialog: `if (await confirm('Delete?')) { ... }`
// <ConfirmDialog /> in App.vue renders this shared state.
const state = reactive({ open: false, title: '', message: '', confirmLabel: 'Confirm', resolve: null })

export function useConfirm() {
  function confirm({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm' } = {}) {
    Object.assign(state, { open: true, title, message, confirmLabel })
    return new Promise((resolve) => {
      state.resolve = resolve
    })
  }

  function answer(value) {
    state.open = false
    state.resolve?.(value)
    state.resolve = null
  }

  return { state, confirm, answer }
}
