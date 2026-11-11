<script setup>
import { computed } from 'vue'
import { getImageUrl } from '@/services/storageService'
import { gameTypeInfo, formatChips } from '@/lib/format'
import { photoUrl, gamePhotoKey } from '@/lib/images'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  game: { type: Object, required: true },
  badge: { type: String, default: '' } // optional label in the corner, e.g. "Hot"
})

const typeInfo = computed(() => gameTypeInfo(props.game.type))
const imageUrl = computed(() => getImageUrl(props.game.imageId))
// Without an uploaded cover we show a high-resolution stock photo for the game type.
const photoKey = computed(() => gamePhotoKey(props.game.type))
</script>

<template>
  <article class="game-card">
    <RouterLink :to="{ name: 'game', params: { id: game.$id } }" class="link">
      <div class="cover" :class="game.type">
        <img v-if="imageUrl" :src="imageUrl" :alt="`${game.name} cover`" loading="lazy" />
        <img
          v-else
          :src="photoUrl(photoKey, 800)"
          :srcset="`${photoUrl(photoKey, 800)} 800w, ${photoUrl(photoKey, 1600)} 1600w`"
          sizes="(max-width: 640px) 100vw, 400px"
          alt=""
          loading="lazy"
        />
        <span class="type-chip"><AppIcon :name="typeInfo.icon" :size="14" /> {{ typeInfo.label }}</span>
        <span v-if="badge" class="badge"><AppIcon name="flame" :size="13" /> {{ badge }}</span>
        <span class="play" aria-hidden="true"><span class="play-btn"><AppIcon name="play" :size="16" /> Play now</span></span>
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
.cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgb(10 11 20 / 0.75), transparent 55%);
}
.game-card:hover .cover img {
  transform: scale(1.08);
}
.type-chip {
  position: absolute;
  z-index: 1;
  right: 0.75rem;
  bottom: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  background: rgb(10 11 20 / 0.6);
  border: 1px solid rgb(255 255 255 / 0.15);
  backdrop-filter: blur(6px);
}
.badge {
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
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
  z-index: 2;
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(10 11 20 / 0.55);
  opacity: 0;
  transition: opacity 0.25s;
}
.play-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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
