import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { listMyClaimedIds } from '@/services/claimService'
import { casino } from '@/services/casinoApi'
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
      // The server checks the dates, takes the amount from the database and refuses a 2nd claim.
      const res = await casino.claimPromotion(promotion.$id)
      profileStore.setProfile(res.profile)
      claimedIds.value.push(promotion.$id)
      toast.success(`${formatChips(res.amount)} bonus chips added!`)
    } catch (e) {
      if (e.code === 409) claimedIds.value.push(promotion.$id)
      toast.error(toMessage(e))
    } finally {
      claimingId.value = null
    }
  }

  const isClaimed = (id) => claimedIds.value.includes(id)

  return { claimedIds, claimingId, loadClaims, claim, isClaimed }
}
