<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { usePromotionClaims } from '@/composables/usePromotionClaims'
import { listPromotions } from '@/services/promotionService'
import PromotionCard from '@/components/promotions/PromotionCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth = useAuthStore()
const { data: promotions, loading, error, run } = useAsync(() => listPromotions({ onlyCurrent: true }), {
  initialData: []
})
const { claimingId, loadClaims, claim, isClaimed } = usePromotionClaims()

onMounted(loadClaims)
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>Promotions</h1>
        <p>Free bonus chips – every promotion can be claimed once per account.</p>
      </div>
    </header>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState v-else-if="!promotions.length" icon="🎁" title="No promotions right now" message="Check back soon!" />
    <div v-else class="grid">
      <PromotionCard
        v-for="promo in promotions"
        :key="promo.$id"
        :promotion="promo"
        :can-claim="auth.isLoggedIn"
        :claimed="isClaimed(promo.$id)"
        :claiming="claimingId === promo.$id"
        @claim="claim"
      />
    </div>
  </div>
</template>
