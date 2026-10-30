# Exam notes – how to explain the project

Short answers for the most likely questions, with links to the code.

---

## 1. The big picture in one minute

> "Royal Chip Casino is a Vue 3 single-page app with Appwrite as the backend. Visitors can browse games and
> promotions. Logged-in players get a balance stored in Appwrite and can play five games; every round is
> saved as a bet. Staff with the *admin* or *editor* label manage games, promotions and players in `/admin`.
> Permissions are enforced in three places: the UI, the router guard and – most importantly – the Appwrite
> table permissions."

Layers (top to bottom):

```
views/        pages, one per route          (what the user sees)
components/   reusable UI pieces            (props in, events out)
composables/  reusable logic with state     (useBet, useForm, useAsync)
stores/       global state (Pinia)          (who is logged in, balance)
services/     Appwrite calls                (the only place that talks to the backend)
lib/appwrite  SDK configuration
games/        pure game rules               (no Vue, no Appwrite → unit tested)
```

---

## 2. Walk-through: what happens when I click "Spin" in Slots?

File: [src/components/games/SlotsGame.vue](../src/components/games/SlotsGame.vue)

1. `spin()` calls `startRound()` from **`useBet`** ([src/composables/useBet.js](../src/composables/useBet.js)).
2. `startRound()` validates the stake with `validateStake()` (min/max bet, enough chips, whole number).
3. It subtracts the stake: `profileStore.save({ balance: balance - stake })`
   → `profileService.updateProfile()` → `db.updateRow()` → **Appwrite**.
4. `spinReels()` from [src/games/slots.js](../src/games/slots.js) decides the result **before** the animation,
   using `crypto.getRandomValues` ([src/games/rng.js](../src/games/rng.js)).
5. The reels animate, then `slotsMultiplier()` and `calcPayout()` compute the win.
6. `settleRound(payout, outcome)` adds the payout + updates statistics in the profile, and
   `recordBet()` creates a row in the `bets` table with read permission only for that player.
7. The header balance updates automatically, because `BalanceChip` reads the same Pinia store.

All five games use the same `useBet` flow – only step 4–5 differ. **That is why `useBet` is a composable.**

---

## 3. Authentication & protected routes

- Login/register/logout: [src/services/authService.js](../src/services/authService.js) (Appwrite Account API,
  email + password session stored by Appwrite in a cookie).
- State: [src/stores/auth.js](../src/stores/auth.js). `init()` asks Appwrite "who am I?" **once** and caches the promise.
- Guard: [src/router/index.js](../src/router/index.js)

```js
router.beforeEach(async (to) => {
  await auth.init()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) return { name: 'forbidden' }
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: 'home' }
})
```

- `meta` is defined per route in [src/router/routes.js](../src/router/routes.js). The `/admin` parent route has
  `roles: ['admin', 'editor']`; children like `/admin/players` narrow it to `['admin']`.
  Vue Router merges `meta` of parent and child, so the guard sees both.
- After login the user is redirected back to `?redirect=`; only internal paths (`/...` but not `//...`)
  are accepted to avoid an *open redirect*.

**"Isn't hiding the Admin link enough?"** – No. The guard stops navigation, and even if someone bypasses
the frontend, Appwrite refuses the request because of the table permissions (see next section).

---

## 4. Permissions – the important part

Defined as data in [scripts/schema.js](../scripts/schema.js) and created by `npm run setup:appwrite`.

- **Table permissions** apply to all rows (e.g. `games`: `read(any)`, `create/update(label:admin|editor)`, `delete(label:admin)`).
- **Row security** (`rowSecurity: true`) additionally allows permissions **per row**.
  Used for `profiles`, `bets`, `claims`:
  - `profiles`: each row has `update(user:<owner>)` → I can only change my own profile.
  - `bets`: each row has `read(user:<owner>)` → I only see my own bets. No one except admins can delete,
    nobody can update → history is tamper-proof.
- Roles are **labels** on the Appwrite user. Only a server API key can set them (`scripts/set-role.js`).

**Demo idea for the exam:** log in as an editor and try to open `/admin/players` → *No access* page.
Then show in `schema.js` that editors don't have `delete` on games, so even a manual API call fails with 401.

**Known limitation** (say it before the examiner does): the player can update their own balance through the API.
The proper fix is an Appwrite Function that runs the game server-side. See README → *Known limitation*.

---

## 5. CRUD – where is each operation?

| | Games | Promotions | Profiles | Bets | Claims |
| --- | --- | --- | --- | --- | --- |
| **Create** | Admin → New game (+ image upload) | Admin → New promotion | automatically on first login | every finished round | Claim button |
| **Read** | lobby, game page, admin list | promotions page, admin list | header balance, leaderboard, admin players | profile history, admin bet log | promotions page (claimed state) |
| **Update** | edit form, Publish/Hide | edit form | username on profile; admin edits balance; every round | – (not allowed) | – |
| **Delete** | admin only (also deletes the image file) | admin only | admin only | admin only | – |

---

## 6. Why these technical choices?

| Question | Answer |
| --- | --- |
| Why Pinia? | Balance and user are needed in many places (header, games, profile). A store avoids passing props through many levels. |
| Why composables and not everything in components? | `useBet` is shared by 5 games, `useAsync` by ~15 pages, `useForm` by 5 forms. Logic is written once and tested once. |
| Why a `services/` layer? | Components don't know how Appwrite works. If the backend changed, only services would change. |
| Why `games/` without Vue? | Pure functions are easy to unit test and easy to reason about. |
| Why row ID = user ID for profiles? | One profile per user, and it can be loaded with `getRow` directly, no query needed. |
| Why copy `gameName` into bets? | A bet is history – it must still make sense if the game is renamed or deleted. |
| Why `crypto.getRandomValues`? | `Math.random()` is not meant for unpredictable numbers. |
| Why lazy-loaded routes and game components? | Smaller initial download; a game's code is loaded only when it's opened. |
| Why integers for chips? | No floating point rounding errors; payouts are rounded down with `Math.floor`. |
| Why the native `<dialog>` for confirmations? | Built-in focus handling and Escape key → better accessibility with less code. |

---

## 7. UX states checklist (to show in the demo)

- Loading: open the games page on a slow network (DevTools → Network → Slow 3G).
- Error: switch DevTools to *Offline* and press *Try again*.
- Empty: search for a game that doesn't exist.
- Validation: submit the register form empty; enter different passwords.
- Feedback: toasts after saving/deleting; confirm dialog before deleting.
- Permissions: editor → `/admin/players` → *No access*; guest → `/profile` → redirected to login.
