import { ref } from 'vue'

// Module-level state = shared by every component that calls useToast().
const toasts = ref([])
let nextId = 1

export function useToast() {
  function show(message, type = 'info', timeout = 3500) {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), timeout)
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    dismiss,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error', 6000),
    info: (msg) => show(msg, 'info')
  }
}
