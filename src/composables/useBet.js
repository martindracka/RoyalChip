import { ref, computed, toValue } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { validateStake } from '@shared/rules.js'
import { toMessage } from '@/lib/errors'
import { useToast } from './useToast'

// Shared betting flow used by the one-shot games (slots, roulette, dice, coin flip):
//   1. placeBet(request) – checks the stake for quick feedback, then lets the SERVER play the round
//   2. the game component animates towards the result the server returned
//   3. finishRound(res)  – shows the result and the balance the server calculated
// The browser never decides a result or a payout – it only displays them.
export function useBet(gameSource) {
  const profileStore = useProfileStore()
  const toast = useToast()

  const game = computed(() => toValue(gameSource))
  const amount = ref(toValue(gameSource)?.minBet ?? 10)
  const inRound = ref(false)
  const busy = ref(false)
  const lastResult = ref(null)

  // Only for the UI – the server checks the same rules again.
  const validationError = computed(() => validateStake(amount.value, game.value, profileStore.balance))
  const canBet = computed(() => !busy.value && !inRound.value && !validationError.value)

  // request = async (stake) => serverResponse
  async function placeBet(request) {
    if (validationError.value) {
      toast.error(validationError.value)
      return null
    }
    busy.value = true
    lastResult.value = null
    try {
      const stake = Number(amount.value)
      const res = await request(stake)
      inRound.value = true
      profileStore.showPendingStake(stake)
      return res
    } catch (e) {
      toast.error(toMessage(e))
      return null
    } finally {
      busy.value = false
    }
  }

  function finishRound(res) {
    profileStore.setProfile(res.profile)
    lastResult.value = { stake: res.stake, payout: res.payout, net: res.payout - res.stake, outcome: res.outcome }
    inRound.value = false
  }

  return { amount, inRound, busy, lastResult, validationError, canBet, placeBet, finishRound }
}
