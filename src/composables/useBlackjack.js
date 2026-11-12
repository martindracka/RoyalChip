import { ref, computed, toValue, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { casino } from '@/services/casinoApi'
import { validateStake } from '@shared/rules.js'
import { toMessage } from '@/lib/errors'
import { useToast } from './useToast'

// Blackjack takes several requests per round. The hand lives on the server, which only
// sends what the player may see: their cards and the dealer's FIRST card (no deck, no hole card).
export function useBlackjack(gameSource) {
  const profileStore = useProfileStore()
  const toast = useToast()
  const game = computed(() => toValue(gameSource))

  const amount = ref(toValue(gameSource)?.minBet ?? 20)
  const round = ref(null) // public round from the server
  const busy = ref(false)
  const lastResult = ref(null)

  const inRound = computed(() => round.value?.status === 'playing')
  const validationError = computed(() => validateStake(amount.value, game.value, profileStore.balance))
  const canDeal = computed(() => !busy.value && !inRound.value && !validationError.value)
  const canAct = computed(() => !busy.value && inRound.value)

  function apply(res) {
    round.value = res.round
    profileStore.setProfile(res.profile)
    if (res.round?.status === 'finished') {
      const { stake, payout, result, playerTotal, dealerTotal } = res.round
      lastResult.value = {
        stake,
        payout,
        net: payout - stake,
        outcome: `${result.toUpperCase()} – you ${playerTotal}, dealer ${dealerTotal}`
      }
    }
  }

  async function run(request) {
    busy.value = true
    try {
      apply(await request())
    } catch (e) {
      toast.error(toMessage(e))
    } finally {
      busy.value = false
    }
  }

  function deal() {
    if (validationError.value) return toast.error(validationError.value)
    lastResult.value = null
    return run(() => casino.blackjackDeal(game.value.$id, Number(amount.value)))
  }
  const hit = () => run(() => casino.blackjackHit())
  const stand = () => run(() => casino.blackjackStand())

  // If the player left in the middle of a hand, continue it (the stake is already taken).
  onMounted(async () => {
    try {
      const { round: saved } = await casino.blackjackState()
      if (saved?.status === 'playing' && saved.gameId === game.value.$id) round.value = saved
    } catch {
      // not critical – the player can simply deal a new hand
    }
  })

  return { amount, round, busy, inRound, lastResult, validationError, canDeal, canAct, deal, hit, stand }
}
