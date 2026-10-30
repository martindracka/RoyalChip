<template>
  <footer class="footer">
    <div class="container inner">
      <p>
        <strong>Royal Chip Casino</strong> – a school project. Only virtual chips, no real money is involved.
      </p>
      <p class="muted">Gambling can be addictive. Play responsibly · 18+</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 1.5rem 0;
  font-size: 0.9rem;
}
.inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
}
p {
  margin: 0;
}
</style>
