<script setup>
import { computed } from 'vue'
import { getImageUrl } from '@/services/storageService'
import { gameTypeInfo, formatChips } from '@/lib/format'

const props = defineProps({
  game: { type: Object, required: true },
  badge: { type: String, default: '' } // optional label in the corner, e.g. "Hot"
})

const typeInfo = computed(() => gameTypeInfo(props.game.type))
const imageUrl = computed(() => getImageUrl(props.game.imageId))
</script>

<template>
  <article class="game-card">
    <RouterLink :to="{ name: 'game', params: { id: game.$id } }" class="link">
      <div class="cover" :class="game.type">
        <img v-if="imageUrl" :src="imageUrl" :alt="`${game.name} cover`" loading="lazy" />
        <span v-else class="icon" aria-hidden="true">{{ typeInfo.icon }}</span>
        <span v-if="badge" class="badge">🔥 {{ badge }}</span>
        <span class="play" aria-hidden="true"><span class="play-btn">▶ Play now</span></span>
      </div>
      <div class="body">
        <p class="type">{{ typeInfo.label }}</p>
        <h3>{{ game.name }}</h3>
        <p class="limits">
          <span class="coin" aria-hidden="true"></span>
          {{ formatChips(game.minBet) }} – {{ formatChips(game.maxBet) }}
        </p>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.game-card {
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.game-card:hover,
.game-card:focus-within {
  transform: translateY(-6px);
  border-color: rgb(242 185 56 / 0.6);
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(242 185 56 / 0.25);
}
.link {
  color: inherit;
  text-decoration: none;
  display: block;
}
.cover {
  position: relative;
  aspect-ratio: 16 / 10;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: radial-gradient(circle at 30% 20%, #10b981, #022c22 75%);
}
.cover.slots {
  background: radial-gradient(circle at 30% 20%, #d946ef, #3b0764 75%);
}
.cover.roulette {
  background: radial-gradient(circle at 30% 20%, #ef4444, #3f0a0a 75%);
}
.cover.dice {
  background: radial-gradient(circle at 30% 20%, #3b82f6, #0b1a45 75%);
}
.cover.coinflip {
  background: radial-gradient(circle at 30% 20%, #f59e0b, #3d1a02 75%);
}
/* subtle pattern on top of the gradient */
.cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1px);
  background-size: 16px 16px;
  mask-image: linear-gradient(180deg, #000, transparent);
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.icon {
  position: relative;
  font-size: 4.5rem;
  filter: drop-shadow(0 10px 16px rgb(0 0 0 / 0.5));
  transition: transform 0.35s;
}
.game-card:hover .icon,
.game-card:hover .cover img {
  transform: scale(1.12) rotate(-4deg);
}
.badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: linear-gradient(135deg, #ff6b4a, #e11d48);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}
.play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(10 11 20 / 0.55);
  opacity: 0;
  transition: opacity 0.25s;
}
.play-btn {
  background: var(--gold-gradient);
  color: #241600;
  font-weight: 800;
  padding: 0.65rem 1.4rem;
  border-radius: 999px;
  box-shadow: var(--shadow-gold);
  transform: translateY(8px);
  transition: transform 0.25s;
}
.game-card:hover .play,
.game-card:focus-within .play {
  opacity: 1;
}
.game-card:hover .play-btn,
.game-card:focus-within .play-btn {
  transform: translateY(0);
}
.body {
  padding: 1rem 1.25rem 1.2rem;
}
.type {
  margin: 0;
  color: var(--gold);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
h3 {
  margin: 0.2rem 0 0.4rem;
  font-size: 1.2rem;
}
.limits {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  color: var(--text-muted);
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
}
.coin {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--gold-gradient);
}
</style>
