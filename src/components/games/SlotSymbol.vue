<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

// Draws one slot symbol ('cherry', 'lemon', 'bell', 'star', 'gem' or 'seven') as a coloured SVG icon.
defineProps({
  symbol: { type: String, required: true },
  size: { type: [Number, String], default: 64 }
})
</script>

<template>
  <span class="symbol" :class="symbol" role="img" :aria-label="symbol">
    <span v-if="symbol === 'seven'" class="seven" :style="{ fontSize: `${size}px` }">7</span>
    <AppIcon v-else :name="symbol" :size="size" :stroke-width="1.75" />
  </span>
</template>

<style scoped>
.symbol {
  display: inline-grid;
  place-items: center;
  line-height: 1;
}
.cherry {
  color: #dc2626;
}
.lemon {
  color: #eab308;
}
.bell {
  color: #d97706;
}
.star {
  color: #f59e0b;
}
.gem {
  color: #2563eb;
}
.seven {
  font-family: var(--font-display);
  font-weight: 900;
  color: #dc2626;
  text-shadow: 0 2px 0 #7f1d1d;
}
.symbol :deep(svg) {
  fill: currentColor;
  fill-opacity: 0.18;
}
</style>
