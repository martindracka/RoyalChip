<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { photoUrl, photoSrcset } from '@/lib/images'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="auth">
    <aside class="visual" aria-hidden="true">
      <img :src="photoUrl('roulette', 1080)" :srcset="photoSrcset('roulette')" sizes="(max-width: 860px) 0px, 45vw" alt="" />
      <div class="visual-text">
        <p class="visual-title">Your table is <span class="gold-text">ready.</span></p>
        <ul>
          <li><AppIcon name="coins" :size="18" /> 1,000 free chips to start</li>
          <li><AppIcon name="gift" :size="18" /> Daily promotions and bonuses</li>
          <li><AppIcon name="shield" :size="18" /> Play money only – zero risk</li>
        </ul>
      </div>
    </aside>
    <div class="card">
      <span class="badge" aria-hidden="true"><AppIcon name="spade" :size="26" /></span>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="muted">{{ subtitle }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 980px;
  margin: 1.5rem auto;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.45);
}
.visual {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  padding: 2.25rem;
  min-height: 560px;
}
.visual img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
}
.visual::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(0deg, rgb(10 11 20 / 0.95) 10%, rgb(10 11 20 / 0.2) 70%);
}
.visual-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 1rem;
}
.visual ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
  color: rgb(255 255 255 / 0.85);
}
.visual li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.visual li :deep(svg) {
  color: var(--gold);
}
.card {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  align-self: center;
  padding: 2.25rem 2rem;
  text-align: left;
  border-color: var(--border-strong);
}
.badge {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  color: #241600;
  margin-bottom: 1rem;
  background: var(--gold-gradient);
  box-shadow: var(--shadow-gold);
}
:slotted(form) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}
:slotted(.switch) {
  text-align: center;
  margin: 1rem 0 0;
  color: var(--text-muted);
}
:slotted(.form-error) {
  color: var(--red);
  background: rgb(229 72 77 / 0.1);
  border: 1px solid var(--red);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.8rem;
  margin: 0;
}
@media (max-width: 860px) {
  .auth {
    grid-template-columns: 1fr;
    margin: 0.5rem auto;
  }
  .visual {
    display: none;
  }
  .card {
    padding: 1.75rem 1.25rem;
  }
}
</style>
