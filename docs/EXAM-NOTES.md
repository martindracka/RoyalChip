# Exam notes – how to explain the project

Short answers for the most likely questions, with links to the code.

---

## 1. The big picture in one minute

> "Royal Chip Casino is a Vue 3 single-page app with Appwrite as the backend. Visitors can browse games and
> promotions. Logged-in players have a balance stored in Appwrite and play five games. The games are played on
> the **server** by an Appwrite Function – the browser only sends what the player chose and animates the result.
> Staff with the *admin* or *editor* label manage games, promotions and players in `/admin`.
> Players can only **read** the database; all changes of chips go through the Function."

Layers (top to bottom):

```
views/              pages, one per route          (what the user sees)
components/         reusable UI pieces            (props in, events out)
composables/        reusable logic with state     (useBet, useBlackjack, useForm, useAsync)
stores/             global state (Pinia)          (who is logged in, balance)
services/           Appwrite calls                (the only place that talks to the backend)
lib/appwrite        SDK configuration
shared/             game rules + business rules   (used by the browser AND the server)
functions/casino    Appwrite Function             (the only code that changes chips)
```

---

## 2. Walk-through: what happens when I click "Spin" in Slots?

Browser: [src/components/games/SlotsGame.vue](../src/components/games/SlotsGame.vue) →
[src/composables/useBet.js](../src/composables/useBet.js) → [src/services/casinoApi.js](../src/services/casinoApi.js)

1. `spin()` calls `placeBet()`. It checks the stake with `validateStake()` – only for quick feedback in the UI.
2. `casino.play(gameId, stake)` calls the Appwrite Function with `{ action: 'game.play', payload: { gameId, amount } }`.

Server: [functions/casino/src/main.js](../functions/casino/src/main.js) →
[handler.js](../functions/casino/src/handler.js) → [actions/games.js](../functions/casino/src/actions/games.js)

3. `main.js` takes the user ID from the header `x-appwrite-user-id` (set by Appwrite, cannot be faked).
4. `handler.js` checks the action is in the allow-list.
5. `playGame()` loads the game (must be active), checks the stake against **its** min/max and the balance.
6. `chargeStake()` takes the stake with an **atomic** `decrementRowColumn(min: 0)` – two parallel bets can't
   spend the same chips.
7. `spinReels()` from [shared/games/slots.js](../shared/games/slots.js) draws the result with
   `crypto.getRandomValues`, `calcPayout()` computes the win.
8. `settleRound()` adds the payout, updates statistics and creates a `bets` row readable only by the player.
9. The Function returns `{ reels, payout, profile }`.

Browser again:

10. The reels animate towards the reels the server sent, then `finishRound()` puts the server's profile into
    the Pinia store → the header balance updates.

All one-shot games use the same `useBet` flow – only the choices differ (`betType`, `target`, `choice`).
Blackjack has several steps, so it has its own composable [useBlackjack.js](../src/composables/useBlackjack.js)
and stores the running hand on the server.

---

## 3. Authentication & protected routes

- Login/register/logout: [src/services/authService.js](../src/services/authService.js) (Appwrite Account API,
  email + password session managed by Appwrite).
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
- After login the user is redirected back to `?redirect=`; [src/lib/redirect.js](../src/lib/redirect.js) accepts
  only internal paths (not `//evil.com` or `/\evil.com`) to avoid an *open redirect*.

**"Isn't hiding the Admin link enough?"** – No. The guard only improves usability. The database refuses the
request anyway because of the permissions (next section).

---

## 4. Security – the important part

Full document: [docs/SECURITY.md](SECURITY.md).

**One sentence:** *"The browser is not trusted – players can only read the database, and every change of chips
is done by an Appwrite Function that decides the result on the server."*

- **Permissions** are data in [scripts/schema.js](../scripts/schema.js): players have only `read` on
  `profiles`, and only read **their own** rows in `bets`, `claims`, `referralRewards` (row-level permission set
  by the Function). `blackjackRounds` has no permissions at all, so the deck can't be seen.
- **Roles** are Appwrite user **labels**. Only a server API key can set them ([scripts/set-role.js](../scripts/set-role.js)).
- **The Function** gets a short-lived key from Appwrite with only `rows.read`, `rows.write`, `users.read`.
- **Race conditions** are handled by the database: atomic decrement for the stake, an atomic `open` flag so a
  blackjack hand is paid once, unique indexes so a promotion/invite reward is claimed once.
- **Browser side:** no `v-html` (Vue escapes everything), a Content Security Policy in the production build,
  safe redirects, image uploads limited to jpg/png/webp/gif ≤ 2 MB.

**Demo idea for the exam:**
1. Run `npm test` – 30+ tests are attacks (faked payout, parallel bets, double claim, peeking at the deck…).
2. In the browser console send a `PATCH` to my own profile with `balance: 1000000` → **401**
   (snippet in SECURITY.md, section 8).
3. Log in as an editor and open `/admin/players` → *No access*.

**What was wrong before** (good to say yourself): the first version ran the games in the browser and players
could update their own profile, so the balance could be faked from the console. I moved the logic into a
Function and removed the write permissions. Remaining accepted risks are listed in SECURITY.md, section 6.

---

## 5. CRUD – where is each operation?

| | Games | Promotions | Profiles | Bets | Claims | Referral rewards |
| --- | --- | --- | --- | --- | --- | --- |
| **Create** | Admin → New game (+ image upload) | Admin → New promotion | Function on first login (`profile.init`, with invite code) | Function after every round | Function (`promotion.claim`) | Function (`referral.claim`) |
| **Read** | lobby, game page, admin list | promotions page, admin list | header balance, leaderboard, admin players, my invited friends | profile history, admin bet log | promotions page (claimed state) | *Invite friends* (rewarded state) |
| **Update** | edit form, Publish/Hide | edit form | Function (rounds, rename, refill); admin edits balance/username | – (not allowed) | – | – |
| **Delete** | admin only (also deletes the image file) | admin only | admin only | admin only | admin only | admin only |

The admin CRUD for games, promotions and players goes **directly** to the database – allowed for staff by the
table permissions. Everything a *player* does goes through the Function.

---

## 5b. Invite friends (referral programme)

Files: [shared/rules.js](../shared/rules.js) (amounts), [src/composables/useReferrals.js](../src/composables/useReferrals.js),
[functions/casino/src/actions/rewards.js](../functions/casino/src/actions/rewards.js), [actions/profile.js](../functions/casino/src/actions/profile.js).

1. A player copies their link: `/register?ref=<their user ID>`.
2. The friend registers. The Function's `profile.init` accepts the code only if it belongs to **another existing**
   player, stores `referredBy` and gives 1,000 + 250 chips.
3. The inviter's page lists profiles with `referredBy = my ID` and shows progress from the friend's `totalWagered`
   (which only the Function can increase, by real bets).
4. *Claim* calls `referral.claim`. The Function checks `friend.referredBy === me`, `totalWagered >= 500`, the limit of
   20 rewards, creates a `referralRewards` row (unique index on `referredId`) and adds 250 chips.

---

## 6. Why these technical choices?

| Question | Answer |
| --- | --- |
| Why an Appwrite Function? | Code in the browser can be changed by the user. Only code on the server can be trusted to decide results and change balances. |
| Why one Function with actions and not one per action? | One deployment, one place for authentication and error handling; the allow-list in `handler.js` keeps it explicit. |
| Why `shared/`? | The server uses the game rules to play, the UI uses the same rules to show paytables and multipliers. One source, no copy-paste. |
| Why the small `db` adapter in the Function? | The actions don't depend on the SDK, so the tests can run the real actions against an in-memory database. |
| Why atomic increment/decrement instead of read-then-write? | Two requests at the same time would both read the old balance. The database applies the change in one step. |
| Why Pinia? | Balance and user are needed in many places (header, games, profile). |
| Why composables? | `useBet` is shared by 4 games, `useAsync` by ~15 pages, `useForm` by 5 forms. |
| Why a `services/` layer? | Components don't know how Appwrite works. |
| Why row ID = user ID for profiles and blackjack rounds? | One per user, loadable directly with `getRow`; a duplicate is refused by the database. |
| Why copy `gameName` into bets? | A bet is history – it must still make sense if the game is renamed or deleted. |
| Why `crypto.getRandomValues`? | `Math.random()` is predictable; crypto RNG is not. |
| Why integers for chips? | No floating point rounding errors; payouts are rounded down with `Math.floor`. |

---

## 7. UX states checklist (to show in the demo)

- Loading: open the games page on a slow network (DevTools → Network → Slow 3G).
- Error: switch DevTools to *Offline* and press *Try again*.
- Empty: search for a game that doesn't exist.
- Validation: submit the register form empty; enter different passwords; rename to `<script>`.
- Server errors are shown as toasts, e.g. claiming a promotion twice: *"You have already claimed this promotion."*
- Permissions: editor → `/admin/players` → *No access*; guest → `/profile` → redirected to login.
- Blackjack: deal, then reload the page – the hand continues (it is stored on the server).
