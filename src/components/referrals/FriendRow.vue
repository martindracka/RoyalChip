<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatChips, formatDate } from '@/lib/format'
import { REFERRAL_REWARD, WAGER_TARGET } from '@/lib/referral'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps({
  friend: { type: Object, required: true }, // profile + progress + status (from useReferrals)
  claiming: { type: Boolean, default: false }
})
defineEmits(['claim'])
</script>

<template>
  <li class="friend">
    <span class="avatar" aria-hidden="true">{{ friend.username.charAt(0).toUpperCase() }}</span>
    <div class="info">
      <p class="name">{{ friend.username }}</p>
      <p class="joined">Joined {{ formatDate(friend.$createdAt) }}</p>
      <div
        class="bar"
        role="progressbar"
        :aria-valuenow="friend.progress.percent"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`${friend.username} has wagered ${friend.progress.wagered} of ${WAGER_TARGET} chips`"
      >
        <span :style="{ width: friend.progress.percent + '%' }" :class="{ done: friend.progress.ready }"></span>
      </div>
      <p class="progress-text">
        {{ formatChips(Math.min(friend.progress.wagered, WAGER_TARGET)) }} / {{ formatChips(WAGER_TARGET) }} chips wagered
      </p>
    </div>
    <div class="action">
      <BaseButton v-if="friend.status === 'ready'" :loading="claiming" @click="$emit('claim', friend)">
        Claim {{ formatChips(REFERRAL_REWARD) }} chips
      </BaseButton>
      <span v-else-if="friend.status === 'rewarded'" class="done-label"><AppIcon name="circle-check" :size="16" /> Reward claimed</span>
      <span v-else class="pending-label">{{ formatChips(friend.progress.remaining) }} chips to go</span>
    </div>
  </li>
</template>

<style scoped>
.friend {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}
.friend:last-child {
  border-bottom: 0;
}
.avatar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--violet), var(--pink));
  font-weight: 700;
}
p {
  margin: 0;
}
.name {
  font-weight: 700;
}
.joined,
.progress-text {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.bar {
  height: 8px;
  margin: 0.5rem 0 0.3rem;
  max-width: 360px;
  border-radius: 999px;
  background: var(--bg-elevated);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--violet), var(--pink));
  transition: width 0.6s ease;
}
.bar span.done {
  background: var(--gold-gradient);
}
.done-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--green);
  font-weight: 700;
  white-space: nowrap;
}
.pending-label {
  color: var(--text-muted);
  font-size: 0.9rem;
  white-space: nowrap;
}
@media (max-width: 600px) {
  .friend {
    grid-template-columns: auto 1fr;
  }
  .action {
    grid-column: 1 / -1;
  }
}
</style>
