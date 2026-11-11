<template>
  <div class="container setup">
    <div class="card">
      <h1>Almost there!</h1>
      <p>The app is not connected to Appwrite yet.</p>
      <ol>
        <li>Copy <code>.env.example</code> to <code>.env</code></li>
        <li>Fill in <code>VITE_APPWRITE_ENDPOINT</code> and <code>VITE_APPWRITE_PROJECT_ID</code></li>
        <li>Run <code>npm run setup:appwrite</code> to create the database</li>
        <li>Restart <code>npm run dev</code></li>
      </ol>
      <p class="muted">See README.md for the full guide.</p>
    </div>
  </div>
</template>

<style scoped>
.setup {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
code {
  background: var(--bg-elevated);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}
li {
  margin-bottom: 0.4rem;
}
</style>
