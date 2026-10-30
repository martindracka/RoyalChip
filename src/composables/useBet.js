import { ref, computed, toValue } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { recordBet } from '@/services/betService'
import { toMessage } from '@/lib/errors'
import { useToast } from './useToast'

// Shared betting flow used by every game:
//   1. startRound()  – validates the stake and takes it from the balance
//   2. (the game component resolves the round + plays its animation)
//   3. settleRound() – pays out the win, updates statistics and stores the bet in Appwrite
export function useBet(gameSource) {
  const profileStore = useProfileStore()
  const toast = useToast()

  const game = computed(() => toValue(gameSource))
  const amount = ref(toValue(gameSource)?.minBet ?? 10)
  const stake = ref(0)
  const inRound = ref(false)
  const busy = ref(false)
  const lastResult = ref(null)

  const validationError = computed(() => validateStake(amount.value, game.value, profileStore.balance))
  const canBet = computed(() => !busy.value && !inRound.value && !validationError.value)

  async function startRound() {
    if (validationError.value) {
      toast.error(validationError.value)
      return false
    }
    busy.value = true
    try {
      stake.value = Number(amount.value)
      await profileStore.save({ balance: profileStore.balance - stake.value })
      inRound.value = true
      lastResult.value = null
      return true
    } catch (e) {
      toast.error(toMessage(e))
      return false
    } finally {
      busy.value = false
    }
  }

  async function settleRound(payout, outcome) {
    busy.value = true
    const p = profileStore.profile
    try {
      await profileStore.save({
        balance: p.balance + payout,
        totalWagered: p.totalWagered + stake.value,
        totalWon: p.totalWon + payout,
        gamesPlayed: p.gamesPlayed + 1
      })
      await recordBet({ userId: p.$id, username: p.username, game: game.value, amount: stake.value, payout, outcome })
      lastResult.value = { stake: stake.value, payout, net: payout - stake.value, outcome }
    } catch (e) {
      toast.error(toMessage(e))
    } finally {
      inRound.value = false
      busy.value = false
    }
  }

  return { amount, stake, inRound, busy, lastResult, validationError, canBet, startRound, settleRound }
}

// Pure validation – exported for unit tests.
export function validateStake(amount, game, balance) {
  const value = Number(amount)
  if (!game) return 'Game not loaded'
  if (!Number.isInteger(value) || value <= 0) return 'Bet must be a whole number of chips'
  if (value < game.minBet) return `Minimum bet is ${game.minBet}`
  if (value > game.maxBet) return `Maximum bet is ${game.maxBet}`
  if (value > balance) return 'Not enough chips'
  return ''
}
