<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useReferrals } from '@/composables/useReferrals'
import { buildReferralLink } from '@/lib/referral'
import { formatChips } from '@/lib/format'
import InviteLinkBox from './InviteLinkBox.vue'
import FriendRow from './FriendRow.vue'
import StatCard from '@/components/ui/StatCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

// Only rendered for logged-in players (needs auth.user for the link and the queries).
const auth = useAuthStore()
const { friends, stats, loading, error, reload, claimingId, claim } = useReferrals()

const link = computed(() => buildReferralLink(window.location.origin, auth.user.$id))
</script>

<template>
  <div class="dashboard">
    <div class="card">
      <InviteLinkBox :link="link" />
    </div>

    <section class="stats" aria-label="Referral statistics">
      <StatCard icon="👥" label="Friends invited" :value="formatChips(stats.invited)" />
      <StatCard icon="🎁" label="Rewards ready" :value="formatChips(stats.ready)" />
      <StatCard icon="💰" label="Chips earned" :value="formatChips(stats.earned)" />
    </section>

    <section>
      <div class="page-header">
        <h2 class="section-title">Your friends</h2>
        <button type="button" class="refresh" :disabled="loading" @click="reload()">↻ Refresh</button>
      </div>
      <LoadingState v-if="loading" message="Looking for your friends…" />
      <ErrorState v-else-if="error" :message="error" @retry="reload()" />
      <EmptyState
        v-else-if="!friends.length"
        icon="💌"
        title="No friends yet"
        message="Share your link above – friends who join will appear here."
      />
      <ul v-else class="friends">
        <FriendRow
          v-for="friend in friends"
          :key="friend.$id"
          :friend="friend"
          :claiming="claimingId === friend.$id"
          @claim="claim"
        />
      </ul>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.stats {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.page-header {
  margin-bottom: 1rem;
}
.friends {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.refresh {
  font: inherit;
  font-weight: 600;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
}
.refresh:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--border-strong);
}
</style>
