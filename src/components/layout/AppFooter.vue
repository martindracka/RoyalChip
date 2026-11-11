<template>
  <footer class="footer">
    <div class="container inner">
      <div class="brand">
        <p class="logo">Royal<span class="gold-text">Chip</span></p>
        <p class="muted">A play-money casino made as a school project. Only virtual chips – no real money is involved.</p>
      </div>
      <nav class="links" aria-label="Footer">
        <p class="heading">Play</p>
        <RouterLink to="/games">All games</RouterLink>
        <RouterLink to="/promotions">Promotions</RouterLink>
        <RouterLink to="/invite">Invite friends</RouterLink>
        <RouterLink to="/leaderboard">Leaderboard</RouterLink>
      </nav>
      <div class="links">
        <p class="heading">Account</p>
        <RouterLink to="/profile">My profile</RouterLink>
        <RouterLink to="/register">Create account</RouterLink>
      </div>
    </div>
    <div class="container bottom">
      <span class="age" aria-hidden="true">18+</span>
      <p class="muted">Gambling can be addictive. Play responsibly and take breaks.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 2rem;
  border-top: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 2.5rem 0 1.5rem;
  font-size: 0.92rem;
}
.inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
}
p {
  margin: 0;
}
.logo {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}
.brand .muted {
  max-width: 380px;
}
.links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.heading {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
.links a {
  color: var(--text);
  text-decoration: none;
}
.links a:hover {
  color: var(--gold);
}
.bottom {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}
.age {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--red);
  color: var(--red);
  font-weight: 800;
  font-size: 0.8rem;
  flex-shrink: 0;
}
@media (max-width: 700px) {
  .inner {
    grid-template-columns: 1fr 1fr;
  }
  .brand {
    grid-column: 1 / -1;
  }
}
</style>
