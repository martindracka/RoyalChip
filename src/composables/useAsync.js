import { ref, shallowRef } from 'vue'
import { toMessage } from '@/lib/errors'

// Wraps any async function and exposes loading / error / data state for the UI.
// Usage: const { data, loading, error, run } = useAsync(() => listGames())
export function useAsync(fn, { initialData = null, immediate = true } = {}) {
  const data = shallowRef(initialData)
  const loading = ref(false)
  const error = ref('')

  async function run(...args) {
    loading.value = true
    error.value = ''
    try {
      data.value = await fn(...args)
      return data.value
    } catch (e) {
      error.value = toMessage(e)
    } finally {
      loading.value = false
    }
  }

  if (immediate) run()

  return { data, loading, error, run }
}
