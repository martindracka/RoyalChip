<script setup>
import { useAuthStore } from '@/stores/auth'
import { REFERRAL_REWARD, FRIEND_BONUS, WAGER_TARGET } from '@/lib/referral'
import { formatChips } from '@/lib/format'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { photoUrl, photoSrcset } from '@/lib/images'
import ReferralDashboard from '@/components/referrals/ReferralDashboard.vue'

const auth = useAuthStore()

const steps = [
  { icon: 'link', title: 'Share your link', text: 'Copy your personal invite link and send it to friends.' },
  { icon: 'user-plus', title: 'Your friend joins', text: `They get ${formatChips(FRIEND_BONUS)} extra chips on top of the welcome chips.` },
  { icon: 'coins', title: 'You get paid', text: `Once your friend wagers ${formatChips(WAGER_TARGET)} chips, claim ${formatChips(REFERRAL_REWARD)} chips.` }
]
</script>

<template>
  <div class="referrals">
    <section class="hero">
      <img class="hero-bg" :src="photoUrl('chips', 1600)" :srcset="photoSrcset('chips')" sizes="100vw" alt="" />
      <div>
        <p class="eyebrow">Invite friends</p>
        <h1>
          Bring a friend,<br />
          <span class="gold-text">earn {{ formatChips(REFERRAL_REWARD) }} chips.</span>
        </h1>
        <p class="lead">
          There is no limit – every friend who joins through your link and wagers
          {{ formatChips(WAGER_TARGET) }} chips earns you {{ formatChips(REFERRAL_REWARD) }} free chips.
        </p>
        <BaseButton v-if="!auth.isLoggedIn" to="/register" size="lg">Create account to get your link</BaseButton>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="bubble b1"><AppIcon name="user-plus" :size="30" /></span>
        <span class="plus">+</span>
        <span class="bubble b2"><AppIcon name="users" :size="30" /></span>
        <span class="equals">=</span>
        <span class="reward gold-text">+{{ formatChips(REFERRAL_REWARD) }}</span>
      </div>
    </section>

    <ol class="steps">
      <li v-for="(step, i) in steps" :key="step.title" class="step">
        <span class="step-icon" aria-hidden="true"><AppIcon :name="step.icon" :size="22" /></span>
        <div>
          <h3><span class="num">{{ i + 1 }}.</span> {{ step.title }}</h3>
          <p class="muted">{{ step.text }}</p>
        </div>
      </li>
    </ol>

    <ReferralDashboard v-if="auth.isLoggedIn" />
  </div>
</template>

<style scoped>
.referrals {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.hero {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2rem;
  align-items: center;
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--border-strong);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 3rem 2.5rem;
}
.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
}
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgb(10 11 20 / 0.95) 35%, rgb(10 11 20 / 0.55));
}
.eyebrow {
  margin: 0 0 0.75rem;
  color: var(--gold);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.8rem;
}
h1 {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.lead {
  color: var(--text-muted);
  font-size: 1.1rem;
  max-width: 520px;
  margin: 0 0 1.5rem;
}
.hero-art {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-family: var(--font-display);
}
.bubble {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  color: var(--gold);
  background: rgb(10 11 20 / 0.6);
  border: 1px solid rgb(242 185 56 / 0.4);
  backdrop-filter: blur(8px);
  animation: bob 3s ease-in-out infinite;
}
.b2 {
  animation-delay: -1.5s;
}
.plus,
.equals {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-muted);
}
.reward {
  font-size: 2.6rem;
  font-weight: 800;
}
@keyframes bob {
  50% {
    transform: translateY(-8px);
  }
}
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
}
.step-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 12px;
  color: var(--gold);
  background: rgb(242 185 56 / 0.1);
  border: 1px solid rgb(242 185 56 / 0.3);
}
.step h3 {
  font-size: 1.05rem;
  margin: 0 0 0.25rem;
}
.step p {
  margin: 0;
  font-size: 0.92rem;
}
.num {
  color: var(--gold);
}
@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
  .hero-art {
    justify-content: flex-start;
  }
  .steps {
    grid-template-columns: 1fr;
  }
}
</style>
