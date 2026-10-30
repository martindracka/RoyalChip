<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { listGames } from '@/services/gameService'
import { listPromotions } from '@/services/promotionService'
import BaseButton from '@/components/ui/BaseButton.vue'
import GameCard from '@/components/games/GameCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'

const auth = useAuthStore()
const games = useAsync(() => listGames({ onlyActive: true }), { initialData: [] })
const promotions = useAsync(() => listPromotions({ onlyCurrent: true }), { initialData: [] })

const featured = computed(() => games.data.value.slice(0, 4))
const topPromo = computed(() => promotions.data.value[0])
</script>

<template>
  <div class="home">
    <section class="hero">
      <div>
        <p class="eyebrow">Play-money casino · no real money</p>
        <h1>Feel the thrill of the casino floor – risk free.</h1>
        <p class="lead">
          Slots, roulette, blackjack, dice and coin flip. Create an account and get
          <strong>1,000 free chips</strong> to start playing.
        </p>
        <div class="hero-actions">
          <BaseButton v-if="!auth.isLoggedIn" to="/register" size="lg">Create free account</BaseButton>
          <BaseButton to="/games" size="lg" :variant="auth.isLoggedIn ? 'primary' : 'secondary'">Browse games</BaseButton>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span>🎰</span><span>🃏</span><span>🎲</span>
      </div>
    </section>

    <RouterLink v-if="topPromo" to="/promotions" class="promo-banner">
      🎁 <strong>{{ topPromo.title }}</strong> – claim {{ topPromo.bonusAmount }} bonus chips →
    </RouterLink>

    <section>
      <div class="page-header">
        <h2>Featured games</h2>
        <RouterLink to="/games">See all games →</RouterLink>
      </div>
      <LoadingState v-if="games.loading.value" message="Shuffling the decks…" />
      <ErrorState v-else-if="games.error.value" :message="games.error.value" @retry="games.run()" />
      <p v-else-if="!featured.length" class="muted">No games are available right now.</p>
      <div v-else class="grid">
        <GameCard v-for="game in featured" :key="game.$id" :game="game" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}
.hero {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 2rem;
  align-items: center;
  padding: 2rem 0;
}
.eyebrow {
  color: var(--gold);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.8rem;
}
h1 {
  font-size: clamp(2rem, 5vw, 3.2rem);
}
.lead {
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 560px;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
.hero-art {
  position: relative;
  height: 280px;
}
.hero-art span {
  position: absolute;
  font-size: 6rem;
  filter: drop-shadow(0 12px 20px rgb(0 0 0 / 0.5));
  animation: float 4s ease-in-out infinite;
}
.hero-art span:nth-child(1) {
  left: 10%;
  top: 10%;
}
.hero-art span:nth-child(2) {
  right: 10%;
  top: 30%;
  animation-delay: -1.3s;
}
.hero-art span:nth-child(3) {
  left: 35%;
  bottom: 0;
  animation-delay: -2.6s;
}
@keyframes float {
  50% {
    transform: translateY(-14px) rotate(6deg);
  }
}
.promo-banner {
  display: block;
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: linear-gradient(90deg, #8a6414, #e3b341);
  color: #1a1200;
  text-decoration: none;
  font-size: 1.05rem;
}
@media (max-width: 760px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-art {
    display: none;
  }
}
</style>
