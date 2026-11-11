<script setup>
import { useAuthStore } from '@/stores/auth'
import { REFERRAL_REWARD, FRIEND_BONUS, WAGER_TARGET } from '@/lib/referral'
import { formatChips } from '@/lib/format'
import BaseButton from '@/components/ui/BaseButton.vue'
import ReferralDashboard from '@/components/referrals/ReferralDashboard.vue'

const auth = useAuthStore()

const steps = [
  { icon: '🔗', title: 'Share your link', text: 'Copy your personal invite link and send it to friends.' },
  { icon: '🎉', title: 'Your friend joins', text: `They get ${formatChips(FRIEND_BONUS)} extra chips on top of the welcome chips.` },
  { icon: '💰', title: 'You get paid', text: `Once your friend wagers ${formatChips(WAGER_TARGET)} chips, claim ${formatChips(REFERRAL_REWARD)} chips.` }
]
</script>

<template>
  <div class="referrals">
    <section class="hero">
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
        <span class="bubble b1">😎</span>
        <span class="plus">+</span>
        <span class="bubble b2">👥</span>
        <span class="equals">=</span>
        <span class="reward gold-text">+{{ formatChips(REFERRAL_REWARD) }}</span>
      </div>
    </section>

    <ol class="steps">
      <li v-for="(step, i) in steps" :key="step.title" class="step">
        <span class="step-icon" aria-hidden="true">{{ step.icon }}</span>
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
  background:
    radial-gradient(500px 250px at 100% 0%, rgb(236 72 153 / 0.25), transparent 70%),
    radial-gradient(500px 250px at 0% 100%, rgb(139 92 246 / 0.25), transparent 70%),
    var(--surface);
}
.eyebrow {
  margin: 0 0 0.75rem;
  color: var(--pink);
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
  font-size: 2.2rem;
  background: rgb(255 255 255 / 0.08);
  border: 1px solid rgb(255 255 255 / 0.15);
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
  font-size: 1.8rem;
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
