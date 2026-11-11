import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { listReferredFriends } from '@/services/profileService'
import { createReferralReward, listMyRewardedIds } from '@/services/referralService'
import { REFERRAL_REWARD, referralProgress } from '@/lib/referral'
import { toMessage } from '@/lib/errors'
import { formatChips } from '@/lib/format'
import { useAsync } from './useAsync'
import { useToast } from './useToast'

// Everything the "Invite friends" page needs: the friends list, their progress and claiming rewards.
export function useReferrals() {
  const auth = useAuthStore()
  const profileStore = useProfileStore()
  const toast = useToast()
  const rewardedIds = ref([])
  const claimingId = ref(null)

  // Friends are profiles with referredBy = my ID. Their totalWagered tells us the progress.
  const friendsState = useAsync(
    async () => {
      const [friends, rewarded] = await Promise.all([
        listReferredFriends(auth.user.$id),
        listMyRewardedIds(auth.user.$id)
      ])
      rewardedIds.value = rewarded
      return friends
    },
    { initialData: [] }
  )

  // Each friend + progress + status: 'pending' | 'ready' | 'rewarded'
  const friends = computed(() =>
    friendsState.data.value.map((friend) => {
      const progress = referralProgress(friend.totalWagered)
      const rewarded = rewardedIds.value.includes(friend.$id)
      return { ...friend, progress, status: rewarded ? 'rewarded' : progress.ready ? 'ready' : 'pending' }
    })
  )

  const stats = computed(() => ({
    invited: friends.value.length,
    ready: friends.value.filter((f) => f.status === 'ready').length,
    earned: rewardedIds.value.length * REFERRAL_REWARD
  }))

  async function claim(friend) {
    claimingId.value = friend.$id
    try {
      await createReferralReward(auth.user.$id, friend) // 409 if this friend was already rewarded
      await profileStore.save({ balance: profileStore.balance + REFERRAL_REWARD })
      rewardedIds.value = [...rewardedIds.value, friend.$id]
      toast.success(`${formatChips(REFERRAL_REWARD)} chips added for inviting ${friend.username}!`)
    } catch (e) {
      toast.error(e.code === 409 ? 'You already got the reward for this friend.' : toMessage(e))
    } finally {
      claimingId.value = null
    }
  }

  return {
    friends,
    stats,
    loading: friendsState.loading,
    error: friendsState.error,
    reload: friendsState.run,
    claimingId,
    claim
  }
}
