<script setup>
import { computed } from 'vue'
import { getImageUrl } from '@/services/storageService'
import { gameTypeInfo, formatChips } from '@/lib/format'

const props = defineProps({ game: { type: Object, required: true } })

const typeInfo = computed(() => gameTypeInfo(props.game.type))
const imageUrl = computed(() => getImageUrl(props.game.imageId))
</script>

<template>
  <article class="game-card">
    <RouterLink :to="{ name: 'game', params: { id: game.$id } }" class="link">
      <div class="cover" :class="game.type">
        <img v-if="imageUrl" :src="imageUrl" :alt="`${game.name} cover`" loading="lazy" />
        <span v-else class="icon" aria-hidden="true">{{ typeInfo.icon }}</span>
      </div>
      <div class="body">
        <p class="type">{{ typeInfo.label }}</p>
        <h3>{{ game.name }}</h3>
        <p class="limits">Bet {{ formatChips(game.minBet) }} – {{ formatChips(game.maxBet) }}</p>
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
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.game-card:hover,
.game-card:focus-within {
  transform: translateY(-4px);
  border-color: var(--gold);
  box-shadow: 0 12px 30px rgb(227 179 65 / 0.15);
}
.link {
  color: inherit;
  text-decoration: none;
  display: block;
}
.cover {
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0d5c3a, #062a1c);
}
.cover.slots {
  background: linear-gradient(135deg, #7a1f5c, #2a0a20);
}
.cover.roulette {
  background: linear-gradient(135deg, #8b1a1a, #1f0606);
}
.cover.dice {
  background: linear-gradient(135deg, #1f4e8b, #08162b);
}
.cover.coinflip {
  background: linear-gradient(135deg, #8b6b1a, #2b1f06);
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.icon {
  font-size: 4rem;
  filter: drop-shadow(0 6px 10px rgb(0 0 0 / 0.5));
}
.body {
  padding: 1rem 1.25rem 1.25rem;
}
.type {
  margin: 0;
  color: var(--gold);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
h3 {
  margin: 0.2rem 0;
  font-size: 1.25rem;
}
.limits {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
