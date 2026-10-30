<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="auth">
    <div class="card">
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
.card {
  width: min(440px, 100%);
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
