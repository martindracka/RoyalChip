<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { listGames } from '@/services/gameService'
import { listPromotions } from '@/services/promotionService'
import { GAME_TYPES, formatChips } from '@/lib/format'
import { photoUrl, photoSrcset } from '@/lib/images'
import { STARTING_BALANCE } from '@shared/rules.js'
import { REFERRAL_REWARD } from '@/lib/referral'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import GameCard from '@/components/games/GameCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'

const auth = useAuthStore()
const games = useAsync(() => listGames({ onlyActive: true }), { initialData: [] })
const promotions = useAsync(() => listPromotions({ onlyCurrent: true }), { initialData: [] })

const featured = computed(() => games.data.value.slice(0, 4))
const topPromo = computed(() => promotions.data.value[0])

const trust = [
  { icon: 'shield', text: 'Fair, crypto-secure RNG' },
  { icon: 'zap', text: 'Instant payouts' },
  { icon: 'lock', text: 'No real money involved' }
]

const steps = [
  { icon: 'user-plus', title: 'Create an account', text: `Sign up in seconds and get ${formatChips(STARTING_BALANCE)} free chips.` },
  { icon: 'target', title: 'Pick a game', text: 'Slots, roulette, blackjack, dice or a simple coin flip.' },
  { icon: 'trophy', title: 'Climb the leaderboard', text: 'Win chips, claim bonuses and beat other players.' }
]
</script>

<template>
  <div class="home">
    <section class="hero">
      <img
        class="hero-bg"
        :src="photoUrl('hero', 1600)"
        :srcset="photoSrcset('hero')"
        sizes="100vw"
        alt=""
        fetchpriority="high"
      />
      <div class="hero-inner">
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
            <BaseButton v-if="!auth.isLoggedIn" to="/register" size="lg">
              Claim {{ formatChips(STARTING_BALANCE) }} free chips
            </BaseButton>
            <BaseButton v-else to="/games" size="lg"><AppIcon name="play" :size="18" /> Play now</BaseButton>
            <BaseButton to="/games" size="lg" variant="secondary">Browse games</BaseButton>
          </div>
          <ul class="trust">
            <li v-for="item in trust" :key="item.text"><AppIcon :name="item.icon" :size="18" /> {{ item.text }}</li>
          </ul>
        </div>

        <div class="bonus-card" aria-hidden="true">
          <span class="bonus-icon"><AppIcon name="gift" :size="26" /></span>
          <p class="small">Welcome gift</p>
          <p class="big gold-text">+{{ formatChips(topPromo?.bonusAmount || STARTING_BALANCE) }}</p>
          <p class="small">bonus chips</p>
        </div>
      </div>
    </section>

    <nav class="categories" aria-label="Game categories">
      <RouterLink
        v-for="t in GAME_TYPES"
        :key="t.value"
        :to="{ name: 'games', query: { type: t.value } }"
        class="category"
      >
        <img :src="photoUrl(t.value, 640)" :srcset="`${photoUrl(t.value, 640)} 640w, ${photoUrl(t.value, 1080)} 1080w`" sizes="(max-width: 760px) 50vw, 20vw" alt="" loading="lazy" />
        <span class="cat-label">
          <span class="cat-icon"><AppIcon :name="t.icon" :size="18" /></span>
          {{ t.label }}
        </span>
      </RouterLink>
    </nav>

    <section>
      <div class="page-header">
        <h2 class="section-title"><AppIcon name="flame" :size="26" class="title-icon" /> Popular right now</h2>
        <RouterLink to="/games" class="see-all">See all games <AppIcon name="arrow-right" :size="16" /></RouterLink>
      </div>
      <LoadingState v-if="games.loading.value" message="Shuffling the decks…" />
      <ErrorState v-else-if="games.error.value" :message="games.error.value" @retry="games.run()" />
      <p v-else-if="!featured.length" class="muted">No games are available right now.</p>
      <div v-else class="grid">
        <GameCard v-for="(game, i) in featured" :key="game.$id" :game="game" :badge="i === 0 ? 'Hot' : ''" />
      </div>
    </section>

    <RouterLink v-if="topPromo" to="/promotions" class="promo-banner">
      <img class="banner-bg" :src="photoUrl('chips', 1600)" :srcset="photoSrcset('chips')" sizes="100vw" alt="" loading="lazy" />
      <span class="promo-icon" aria-hidden="true"><AppIcon name="gift" :size="30" /></span>
      <span class="promo-text">
        <span class="promo-label">Limited offer</span>
        <strong>{{ topPromo.title }}</strong>
        <span>Claim <b>{{ formatChips(topPromo.bonusAmount) }}</b> bonus chips now</span>
      </span>
      <span class="promo-cta">Claim bonus <AppIcon name="arrow-right" :size="16" /></span>
    </RouterLink>

    <RouterLink to="/invite" class="invite-banner">
      <span class="invite-icon" aria-hidden="true"><AppIcon name="users" :size="26" /></span>
      <span class="invite-text">
        <strong>Invite friends, earn {{ formatChips(REFERRAL_REWARD) }} chips each</strong>
        <span class="muted">Your friends get extra chips too. No limit on invites.</span>
      </span>
      <span class="invite-cta">Get your link <AppIcon name="arrow-right" :size="16" /></span>
    </RouterLink>

    <section>
      <h2 class="section-title center">How it works</h2>
      <ol class="steps">
        <li v-for="(step, i) in steps" :key="step.title" class="step">
          <span class="step-num" aria-hidden="true">0{{ i + 1 }}</span>
          <span class="step-icon" aria-hidden="true"><AppIcon :name="step.icon" :size="24" /></span>
          <h3>{{ step.title }}</h3>
          <p class="muted">{{ step.text }}</p>
        </li>
      </ol>
    </section>

    <section v-if="!auth.isLoggedIn" class="final-cta">
      <img class="banner-bg" :src="photoUrl('cards', 1600)" :srcset="photoSrcset('cards')" sizes="100vw" alt="" loading="lazy" />
      <div class="final-inner">
        <h2>Ready to <span class="gold-text">hit the jackpot?</span></h2>
        <p>Join now – your {{ formatChips(STARTING_BALANCE) }} chips are waiting.</p>
        <BaseButton to="/register" size="lg">Create free account</BaseButton>
      </div>
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
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  min-height: 540px;
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.5);
}
.hero-bg,
.banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(90deg, rgb(10 11 20 / 0.95) 0%, rgb(10 11 20 / 0.82) 45%, rgb(10 11 20 / 0.35) 100%),
    linear-gradient(0deg, rgb(10 11 20 / 0.7), transparent 40%);
}
.hero-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  align-items: center;
  gap: 2rem;
  padding: 3.5rem;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gold-strong);
  background: rgb(242 185 56 / 0.12);
  border: 1px solid rgb(242 185 56 / 0.35);
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0 0 1.25rem;
  backdrop-filter: blur(6px);
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
  color: rgb(255 255 255 / 0.75);
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
  margin: 1.75rem 0 0;
  color: rgb(255 255 255 / 0.75);
  font-size: 0.92rem;
}
.trust li {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}
.trust :deep(svg) {
  color: var(--gold);
}

.bonus-card {
  justify-self: center;
  width: 250px;
  padding: 1.75rem 1.5rem;
  text-align: center;
  border-radius: 22px;
  background: linear-gradient(160deg, rgb(20 22 38 / 0.75), rgb(20 22 38 / 0.45));
  border: 1px solid rgb(242 185 56 / 0.35);
  backdrop-filter: blur(14px);
  box-shadow: 0 30px 60px rgb(0 0 0 / 0.55), var(--shadow-gold);
  animation: float 6s ease-in-out infinite;
}
.bonus-icon {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 0.75rem;
  border-radius: 50%;
  background: var(--gold-gradient);
  color: #241600;
}
.bonus-card p {
  margin: 0;
}
.bonus-card .small {
  color: var(--text-muted);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.bonus-card .big {
  font-family: var(--font-display);
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.1;
}
@keyframes float {
  50% {
    transform: translateY(-10px);
  }
}

/* ---------- Categories (photo tiles) ---------- */
.categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}
.category {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  color: #fff;
  text-decoration: none;
  isolation: isolate;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.category img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
  transition: transform 0.5s;
}
.category::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(0deg, rgb(10 11 20 / 0.92) 5%, rgb(10 11 20 / 0.1) 60%);
}
.category:hover,
.category:focus-visible {
  transform: translateY(-4px);
  border-color: rgb(242 185 56 / 0.6);
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.45);
}
.category:hover img {
  transform: scale(1.08);
}
.cat-label {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
}
.cat-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--gold-gradient);
  color: #241600;
}

.section-title.center {
  justify-content: center;
  margin-bottom: 1.5rem;
}
.title-icon {
  color: #ff6b4a;
}
.see-all {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

/* ---------- Promo banner ---------- */
.promo-banner {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 2.25rem 2rem;
  border-radius: 22px;
  overflow: hidden;
  color: #fff;
  text-decoration: none;
  border: 1px solid rgb(242 185 56 / 0.3);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.4);
  transition: transform 0.2s;
}
.promo-banner .banner-bg {
  z-index: -2;
}
.promo-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgb(10 11 20 / 0.95) 20%, rgb(10 11 20 / 0.55) 70%, rgb(10 11 20 / 0.3));
}
.promo-banner:hover {
  transform: translateY(-3px);
}
.promo-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 18px;
  background: var(--gold-gradient);
  color: #241600;
  box-shadow: var(--shadow-gold);
}
.promo-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.promo-text strong {
  font-family: var(--font-display);
  font-size: 1.7rem;
  line-height: 1.2;
}
.promo-text b {
  color: var(--gold);
}
.promo-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--gold);
}
.promo-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--gold-gradient);
  color: #241600;
  font-weight: 800;
  padding: 0.8rem 1.5rem;
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
  border-color: var(--gold);
  transform: translateY(-2px);
}
.invite-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 16px;
  color: var(--gold);
  background: rgb(242 185 56 / 0.1);
  border: 1px solid rgb(242 185 56 / 0.3);
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
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--gold);
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
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  color: var(--gold);
  background: rgb(242 185 56 / 0.1);
  border: 1px solid rgb(242 185 56 / 0.3);
}
.step h3 {
  margin: 1rem 0 0.35rem;
  font-size: 1.2rem;
}
.step p {
  margin: 0;
}

/* ---------- Final CTA ---------- */
.final-cta {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  text-align: center;
  padding: 4rem 1.5rem;
  border-radius: 24px;
  border: 1px solid var(--border);
}
.final-cta .banner-bg {
  z-index: -2;
}
.final-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(circle at 50% 50%, rgb(10 11 20 / 0.6), rgb(10 11 20 / 0.92) 70%);
}
.final-cta h2 {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
}
.final-cta p {
  margin: 0 0 1.5rem;
  color: rgb(255 255 255 / 0.75);
}

@media (max-width: 960px) {
  .categories {
    grid-template-columns: repeat(3, 1fr);
  }
  .hero-inner {
    grid-template-columns: 1fr;
    padding: 2.5rem 2rem;
  }
  .bonus-card {
    display: none;
  }
}
@media (max-width: 760px) {
  .hero {
    min-height: 0;
  }
  .hero-inner {
    padding: 2rem 1.25rem;
  }
  .hero::after {
    background: linear-gradient(0deg, rgb(10 11 20 / 0.95) 30%, rgb(10 11 20 / 0.6));
  }
  .categories {
    grid-template-columns: repeat(2, 1fr);
  }
  .category:last-child {
    grid-column: span 2;
    aspect-ratio: 2 / 1;
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
