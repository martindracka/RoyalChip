<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="auth">
    <div class="card">
      <span class="badge" aria-hidden="true">🎰</span>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="muted">{{ subtitle }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  place-items: center;
  padding: 2rem 0;
}
.auth {
  background: radial-gradient(500px 300px at 50% 20%, rgb(139 92 246 / 0.18), transparent 70%);
}
.card {
  width: min(460px, 100%);
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
  font-size: 1.8rem;
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
</style>
