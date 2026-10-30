<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, default: null },
  hidden: { type: Boolean, default: false }
})

const isRed = computed(() => ['♥', '♦'].includes(props.card?.suit))
const label = computed(() => (props.hidden || !props.card ? 'Hidden card' : `${props.card.rank} of ${props.card.suit}`))
</script>

<template>
  <div class="card-face" :class="{ hidden, red: isRed }" role="img" :aria-label="label">
    <template v-if="!hidden && card">
      <span class="corner">{{ card.rank }}<br />{{ card.suit }}</span>
      <span class="suit" aria-hidden="true">{{ card.suit }}</span>
    </template>
  </div>
</template>

<style scoped>
.card-face {
  position: relative;
  width: 78px;
  height: 112px;
  border-radius: 8px;
  background: #fdfcf7;
  color: #111;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.4);
  display: grid;
  place-items: center;
  animation: deal 0.3s ease;
  flex-shrink: 0;
}
.red {
  color: #c62828;
}
.hidden {
  background: repeating-linear-gradient(45deg, #8b1a1a 0 6px, #6d1212 6px 12px);
  border: 4px solid #fdfcf7;
}
.corner {
  position: absolute;
  top: 6px;
  left: 8px;
  font-weight: 700;
  line-height: 1.05;
  font-size: 0.95rem;
}
.suit {
  font-size: 2.4rem;
}
@keyframes deal {
  from {
    transform: translateY(-30px) rotate(-8deg);
    opacity: 0;
  }
}
</style>
