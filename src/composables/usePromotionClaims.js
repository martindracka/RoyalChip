import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { createClaim, listMyClaimedIds } from '@/services/claimService'
import { toMessage } from '@/lib/errors'
import { formatChips } from '@/lib/format'
import { useToast } from './useToast'

export function usePromotionClaims() {
  const auth = useAuthStore()
  const profileStore = useProfileStore()
  const toast = useToast()
  const claimedIds = ref([])
  const claimingId = ref(null)

  async function loadClaims() {
    if (!auth.isLoggedIn) return
    try {
      claimedIds.value = await listMyClaimedIds(auth.user.$id)
    } catch (e) {
      toast.error(toMessage(e))
    }
  }

  async function claim(promotion) {
    claimingId.value = promotion.$id
    try {
      await createClaim(auth.user.$id, promotion) // fails with 409 if already claimed
      await profileStore.save({ balance: profileStore.balance + promotion.bonusAmount })
      claimedIds.value.push(promotion.$id)
      toast.success(`${formatChips(promotion.bonusAmount)} bonus chips added!`)
    } catch (e) {
      toast.error(e.code === 409 ? 'You have already claimed this promotion.' : toMessage(e))
    } finally {
      claimingId.value = null
    }
  }

  const isClaimed = (id) => claimedIds.value.includes(id)

  return { claimedIds, claimingId, loadClaims, claim, isClaimed }
}
