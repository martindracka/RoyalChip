<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { listGames } from '@/services/gameService'
import { listPromotions } from '@/services/promotionService'
import { GAME_TYPES, formatChips } from '@/lib/format'
import { STARTING_BALANCE } from '@/services/profileService'
import { REFERRAL_REWARD } from '@/lib/referral'
import BaseButton from '@/components/ui/BaseButton.vue'
import GameCard from '@/components/games/GameCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'

const auth = useAuthStore()
const games = useAsync(() => listGames({ onlyActive: true }), { initialData: [] })
const promotions = useAsync(() => listPromotions({ onlyCurrent: true }), { initialData: [] })

const featured = computed(() => games.data.value.slice(0, 4))
const topPromo = computed(() => promotions.data.value[0])

const steps = [
  { icon: '📝', title: 'Create an account', text: `Sign up in seconds and get ${formatChips(STARTING_BALANCE)} free chips.` },
  { icon: '🎯', title: 'Pick a game', text: 'Slots, roulette, blackjack, dice or a simple coin flip.' },
  { icon: '🏆', title: 'Climb the leaderboard', text: 'Win chips, claim bonuses and beat other players.' }
]
</script>

<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-text">
        <p class="eyebrow"><span class="live" aria-hidden="true"></span> Play-money casino · no real money</p>
        <h1>
          The casino floor,<br />
          <span class="gold-text">right in your browser.</span>
        </h1>
        <p class="lead">
          Spin, deal and roll in five beautifully crafted games. Start with
          <strong>{{ formatChips(STARTING_BALANCE) }} free chips</strong> – no deposit, no risk.
        </p>
        <div class="hero-actions">
          <BaseButton v-if="!auth.isLoggedIn" to="/register" size="lg">Claim {{ formatChips(STARTING_BALANCE) }} free chips</BaseButton>
          <BaseButton v-else to="/games" size="lg">Play now</BaseButton>
          <BaseButton to="/games" size="lg" variant="secondary">Browse games</BaseButton>
        </div>
        <ul class="trust">
          <li><span aria-hidden="true">✓</span> Free to play</li>
          <li><span aria-hidden="true">✓</span> Instant payouts</li>
          <li><span aria-hidden="true">✓</span> Fair, crypto-secure RNG</li>
        </ul>
      </div>

      <div class="hero-art" aria-hidden="true">
        <div class="glow"></div>
        <div class="chip chip-a"></div>
        <div class="chip chip-b"></div>
        <div class="bonus-card">
          <p class="small">Welcome gift</p>
          <p class="big gold-text">+{{ formatChips(topPromo?.bonusAmount || STARTING_BALANCE) }}</p>
          <p class="small">bonus chips</p>
        </div>
        <span class="float f1">🎰</span>
        <span class="float f2">🃏</span>
        <span class="float f3">🎲</span>
      </div>
    </section>

    <!-- CATEGORIES -->
    <nav class="categories" aria-label="Game categories">
      <RouterLink
        v-for="t in GAME_TYPES"
        :key="t.value"
        :to="{ name: 'games', query: { type: t.value } }"
        class="category"
        :class="t.value"
      >
        <span class="cat-icon" aria-hidden="true">{{ t.icon }}</span>
        <span>{{ t.label }}</span>
      </RouterLink>
    </nav>

    <!-- FEATURED -->
    <section>
      <div class="page-header">
        <h2 class="section-title"><span aria-hidden="true">🔥</span> Popular right now</h2>
        <RouterLink to="/games">See all games →</RouterLink>
      </div>
      <LoadingState v-if="games.loading.value" message="Shuffling the decks…" />
      <ErrorState v-else-if="games.error.value" :message="games.error.value" @retry="games.run()" />
      <p v-else-if="!featured.length" class="muted">No games are available right now.</p>
      <div v-else class="grid">
        <GameCard v-for="(game, i) in featured" :key="game.$id" :game="game" :badge="i === 0 ? 'Hot' : ''" />
      </div>
    </section>

    <!-- PROMO -->
    <RouterLink v-if="topPromo" to="/promotions" class="promo-banner">
      <span class="promo-icon" aria-hidden="true">🎁</span>
      <span class="promo-text">
        <span class="promo-label">Limited offer</span>
        <strong>{{ topPromo.title }}</strong>
        <span>Claim <b>{{ formatChips(topPromo.bonusAmount) }}</b> bonus chips now</span>
      </span>
      <span class="promo-cta">Claim bonus →</span>
    </RouterLink>

    <!-- INVITE FRIENDS -->
    <RouterLink to="/invite" class="invite-banner">
      <span class="invite-icon" aria-hidden="true">👥</span>
      <span class="invite-text">
        <strong>Invite friends, earn {{ formatChips(REFERRAL_REWARD) }} chips each</strong>
        <span class="muted">Your friends get extra chips too. No limit on invites.</span>
      </span>
      <span class="invite-cta">Get your link →</span>
    </RouterLink>

    <!-- HOW IT WORKS -->
    <section>
      <h2 class="section-title center">How it works</h2>
      <ol class="steps">
        <li v-for="(step, i) in steps" :key="step.title" class="step">
          <span class="step-num" aria-hidden="true">{{ i + 1 }}</span>
          <span class="step-icon" aria-hidden="true">{{ step.icon }}</span>
          <h3>{{ step.title }}</h3>
          <p class="muted">{{ step.text }}</p>
        </li>
      </ol>
    </section>

    <!-- FINAL CTA -->
    <section v-if="!auth.isLoggedIn" class="final-cta">
      <h2>Ready to <span class="gold-text">hit the jackpot?</span></h2>
      <p class="muted">Join now – your {{ formatChips(STARTING_BALANCE) }} chips are waiting.</p>
      <BaseButton to="/register" size="lg">Create free account</BaseButton>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

/* ---------- Hero ---------- */
.hero {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 2rem;
  align-items: center;
  padding: 2.5rem 0 1rem;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gold-strong);
  background: rgb(242 185 56 / 0.1);
  border: 1px solid rgb(242 185 56 / 0.3);
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0 0 1.25rem;
}
.live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 0 rgb(34 197 94 / 0.6);
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  70% {
    box-shadow: 0 0 0 8px rgb(34 197 94 / 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(34 197 94 / 0);
  }
}
h1 {
  font-size: clamp(2.3rem, 5.5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.lead {
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 540px;
}
.lead strong {
  color: var(--text);
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}
.trust {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  color: var(--text-muted);
  font-size: 0.92rem;
}
.trust span {
  color: var(--green);
  font-weight: 700;
  margin-right: 0.2rem;
}

.hero-art {
  position: relative;
  height: 380px;
}
.glow {
  position: absolute;
  inset: 10% 5%;
  background: radial-gradient(circle, rgb(139 92 246 / 0.45), rgb(236 72 153 / 0.15) 45%, transparent 70%);
  filter: blur(20px);
}
.chip {
  position: absolute;
  border-radius: 50%;
  background:
    radial-gradient(circle, #1b1405 0 38%, transparent 39%),
    repeating-conic-gradient(#f5b82e 0 30deg, #fff3cf 30deg 45deg);
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.5), 0 0 30px rgb(242 185 56 / 0.35);
  animation: spin 14s linear infinite;
}
.chip-a {
  width: 120px;
  height: 120px;
  left: 4%;
  top: 8%;
}
.chip-b {
  width: 80px;
  height: 80px;
  right: 6%;
  bottom: 8%;
  animation-direction: reverse;
  background:
    radial-gradient(circle, #2a0b1f 0 38%, transparent 39%),
    repeating-conic-gradient(#ec4899 0 30deg, #ffe4f2 30deg 45deg);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.bonus-card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-4deg);
  width: 230px;
  padding: 1.5rem;
  text-align: center;
  border-radius: 20px;
  background: linear-gradient(160deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.03));
  border: 1px solid rgb(255 255 255 / 0.18);
  backdrop-filter: blur(12px);
  box-shadow: 0 30px 60px rgb(0 0 0 / 0.5);
}
.bonus-card p {
  margin: 0;
}
.bonus-card .small {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.bonus-card .big {
  font-family: var(--font-display);
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.1;
}
.float {
  position: absolute;
  font-size: 3.5rem;
  filter: drop-shadow(0 12px 18px rgb(0 0 0 / 0.5));
  animation: float 5s ease-in-out infinite;
}
.f1 {
  right: 8%;
  top: 4%;
}
.f2 {
  left: 6%;
  bottom: 6%;
  animation-delay: -1.6s;
}
.f3 {
  right: 32%;
  bottom: -2%;
  animation-delay: -3.2s;
}
@keyframes float {
  50% {
    transform: translateY(-14px) rotate(8deg);
  }
}

/* ---------- Categories ---------- */
.categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.9rem;
}
.category {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
}
.category:hover {
  transform: translateY(-3px);
  border-color: var(--gold);
  background: var(--surface-2);
}
.cat-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3b2a7a, #1b1640);
}
.slots .cat-icon {
  background: linear-gradient(135deg, #a21caf, #4a044e);
}
.roulette .cat-icon {
  background: linear-gradient(135deg, #dc2626, #450a0a);
}
.blackjack .cat-icon {
  background: linear-gradient(135deg, #059669, #022c22);
}
.dice .cat-icon {
  background: linear-gradient(135deg, #2563eb, #0b1a45);
}
.coinflip .cat-icon {
  background: linear-gradient(135deg, #d97706, #451a03);
}

.section-title.center {
  justify-content: center;
  margin-bottom: 1.5rem;
}

/* ---------- Promo banner ---------- */
.promo-banner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 1.75rem;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(110deg, #6d28d9 0%, #db2777 55%, #f59e0b 120%);
  color: #fff;
  text-decoration: none;
  box-shadow: 0 20px 50px rgb(219 39 119 / 0.25);
  transition: transform 0.2s;
}
.promo-banner:hover {
  transform: translateY(-3px);
}
.promo-banner::before {
  content: '';
  position: absolute;
  right: -60px;
  top: -60px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.12);
}
.promo-icon {
  font-size: 3rem;
}
.promo-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.promo-text strong {
  font-family: var(--font-display);
  font-size: 1.6rem;
  line-height: 1.2;
}
.promo-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.85;
}
.promo-cta {
  position: relative;
  background: #fff;
  color: #6d28d9;
  font-weight: 800;
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  white-space: nowrap;
}

/* ---------- Invite banner ---------- */
.invite-banner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: -2rem; /* sits close to the promo banner */
  padding: 1.25rem 1.5rem;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  color: var(--text);
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s;
}
.invite-banner:hover {
  border-color: var(--pink);
  transform: translateY(-2px);
}
.invite-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 16px;
  font-size: 1.8rem;
  background: linear-gradient(135deg, var(--violet), var(--pink));
}
.invite-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.invite-text strong {
  font-family: var(--font-display);
  font-size: 1.25rem;
}
.invite-cta {
  color: var(--pink);
  font-weight: 700;
  white-space: nowrap;
}

/* ---------- Steps ---------- */
.steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.step {
  position: relative;
  padding: 1.75rem 1.5rem;
  border-radius: var(--radius);
  background: linear-gradient(180deg, var(--surface-2), var(--surface));
  border: 1px solid var(--border);
}
.step-num {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 800;
  color: rgb(255 255 255 / 0.06);
}
.step-icon {
  font-size: 2rem;
}
.step h3 {
  margin: 0.75rem 0 0.35rem;
  font-size: 1.2rem;
}
.step p {
  margin: 0;
}

/* ---------- Final CTA ---------- */
.final-cta {
  text-align: center;
  padding: 3rem 1.5rem;
  border-radius: 24px;
  background:
    radial-gradient(600px 200px at 50% 0%, rgb(242 185 56 / 0.18), transparent 70%),
    var(--surface);
  border: 1px solid var(--border);
}
.final-cta h2 {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}
.final-cta p {
  margin: 0 0 1.5rem;
}

@media (max-width: 960px) {
  .categories {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .hero {
    grid-template-columns: 1fr;
    padding-top: 1rem;
  }
  .hero-art {
    display: none;
  }
  .categories {
    grid-template-columns: repeat(2, 1fr);
  }
  .steps {
    grid-template-columns: 1fr;
  }
  .promo-banner,
  .invite-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
