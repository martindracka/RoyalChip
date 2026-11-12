# Royal Chip Casino

A play-money online casino built with **Vue 3** and **Appwrite**.
Players register, receive 1,000 virtual chips and play five casino games. Staff manage games,
promotions and players in a protected administration area.

> No real money is involved. All chips are virtual.

- **Live app:** https://royal-chip-casino.appwrite.network
- **Repository:** https://github.com/martindracka/RoyalChip

---

## Features

### For visitors and players
| Feature | Description |
| --- | --- |
| Game lobby | Browse games, search by name, filter by type (searched in Appwrite, not in the browser) |
| 5 games | Slots, European roulette, Blackjack, Dice (over/under), Coin flip – with animations |
| Server-side game engine | Every round is played by the Appwrite Function `casino` – the browser only sends the player's choices, the server draws the result and pays out ([docs/SECURITY.md](docs/SECURITY.md)) |
| Wallet | Balance stored in Appwrite, changed **only** by the server (atomic, can't go below 0) |
| Bet history | Every finished round is stored as an immutable `bets` row |
| Promotions | Bonus chips that can be claimed **once** per account (enforced by a unique DB index) |
| Invite friends | Personal invite link. A friend who joins gets **+250 chips**; once the friend has wagered **500 chips**, the inviter claims **250 chips** (once per friend, enforced by a unique DB index) |
| Leaderboard | Top 10 players by total chips won |
| Profile | Statistics, change username, refill balance when broke |

### For staff (admin area at `/admin`)
| Feature | Admin | Editor |
| --- | :---: | :---: |
| Dashboard with statistics | ✅ full | ✅ content only |
| Create / edit games (incl. cover image upload to Appwrite Storage) | ✅ | ✅ |
| Publish / hide games | ✅ | ✅ |
| Delete games | ✅ | ❌ |
| Create / edit promotions | ✅ | ✅ |
| Delete promotions | ✅ | ❌ |
| Manage players (edit balance/username, delete profile) | ✅ | ❌ |
| Bet log (all players) | ✅ | ❌ |

---

## Tech stack

| Part | Choice | Why |
| --- | --- | --- |
| Framework | Vue 3 (`<script setup>`, Composition API) | Required, small and readable components |
| Build tool | Vite | Fast dev server, simple config |
| Routing | Vue Router (lazy-loaded routes, nested admin routes, global guard) | |
| State | Pinia (`auth` + `profile` stores) | Shared logged-in user and balance |
| Backend | Appwrite Cloud – Auth, TablesDB (database), Storage, **Functions** | Required; the Function runs all game logic on the server |
| Tests | Vitest (pure game logic, validation, roles) | |
| Language | Plain JavaScript | Easier to read and explain |
| Icons | [Lucide](https://lucide.dev) (`lucide-vue-next`) via one `AppIcon` component | Crisp SVG icons instead of emoji, consistent on every OS |
| Photos | [Unsplash](https://unsplash.com) (Unsplash License), see `src/lib/images.js` | High-res photos with `srcset` up to 4K – the browser loads only the size it needs |

---

## Getting started

### 1. Install
```bash
npm install
```

### 2. Create the Appwrite project
1. Sign in at <https://cloud.appwrite.io> and create a **project**.
2. **Overview → Integrations → Platforms → Add platform → Web**. Add hostname `localhost`
   (later also the domain of your deployed site).
3. **Overview → Integrations → API keys → Create API key** with scopes
   `databases.*` / `tables.*` / `columns.*` / `indexes.*` / `rows.*`, `buckets.*`, `files.*`, `functions.*`,
   `execution.*`, `users.read`, `users.write`
   (or simply select all scopes – the key is only used locally by the setup scripts; delete it afterwards).
4. **Auth → Security**: turn on *Password dictionary* and *Personal data check* (see [docs/SECURITY.md](docs/SECURITY.md#7-hardening-checklist-in-the-appwrite-console)).

### 3. Configure `.env`
```bash
cp .env.example .env
```
Fill in `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID` and `APPWRITE_API_KEY`.

> `.env` is in `.gitignore`. The API key has **no** `VITE_` prefix, so Vite never puts it into the browser bundle.

### 4. Create database, tables, permissions, storage, the Function and demo data
```bash
npm run setup:appwrite
```
The script is idempotent – running it again skips what already exists and updates permissions.
It also packs [functions/casino](functions/casino) together with [shared/](shared) and deploys it as the
Appwrite Function `casino` (needs `tar`, which is included in Windows 10+, macOS and Linux).
After changing the Function code you can redeploy only the Function with `npm run deploy:function`.
It also adds demo data: 6 games, 3 promotions and 10 demo players for the leaderboard
(profiles without a login account – an admin can delete them in **Admin → Players**).

### 5. Run the app
```bash
npm run dev
```

### 6. Make yourself admin
Register in the app, then:
```bash
npm run set-role -- your@email.com admin     # or: editor / player
```
Log out and in again. The **Admin** link appears in the header.

### Other commands
```bash
npm test          # unit tests (Vitest)
npm run build     # production build into /dist
```

---

## Deployment (Appwrite Sites)

1. Push the repository to GitHub.
2. Appwrite Console → **Sites → Create site → Connect a repository**.
3. Framework: **Vue.js** · Install command `npm install` · Build command `npm run build` · Output directory `./dist`.
4. Add the environment variables `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`,
   `VITE_APPWRITE_DATABASE_ID`, `VITE_APPWRITE_BUCKET_ID`, `VITE_APPWRITE_FUNCTION_ID` (do **not** add the API key).
   The endpoint is also written into the Content Security Policy of the build.
5. Make sure the **fallback file** is `index.html` (needed for Vue Router history mode, so a refresh on `/games/123` works).
6. Deploy. Add the new domain as a Web platform in the project if Appwrite did not do it automatically.

---

## Project structure

```
src/
├── main.js                 # creates the app, installs Pinia + router
├── App.vue                 # layout shell: header, <RouterView>, footer, toasts, confirm dialog
├── router/
│   ├── index.js            # router + global navigation guard
│   └── routes.js           # route table with meta: requiresAuth / roles / guestOnly
├── lib/                    # small framework-free helpers
│   ├── appwrite.js         # the ONLY place the Appwrite SDK is configured
│   ├── roles.js            # role names + permission table used by the UI
│   ├── referral.js         # invite-friends progress + link – unit tested
│   ├── redirect.js         # safe ?redirect= after login (no open redirect) – unit tested
│   ├── errors.js           # Appwrite error -> human readable message
│   └── format.js, images.js, sleep.js
├── services/               # DATA ACCESS – every Appwrite call lives here
│   ├── db.js               # generic list/get/create/update/delete wrapper
│   ├── casinoApi.js        # calls the casino Function (bets, blackjack, claims, profile)
│   ├── authService.js      # login, register, logout, current user
│   ├── gameService.js, promotionService.js, profileService.js,
│   ├── betService.js, claimService.js, referralService.js, storageService.js
├── stores/                 # GLOBAL STATE (Pinia)
│   ├── auth.js             # user, role, login/logout, init()
│   └── profile.js          # balance + statistics of the logged-in player
├── composables/            # REUSABLE LOGIC for components
│   ├── useAsync.js         # loading / error / data for any async call
│   ├── useBet.js           # shared betting flow for the one-shot games
│   ├── useBlackjack.js     # deal / hit / stand against the server-side hand
│   ├── usePromotionClaims.js
│   ├── useReferrals.js     # invite-friends page: friends, progress, claiming rewards
│   ├── useForm.js          # form state + validation rules
│   ├── useToast.js, useConfirm.js
├── components/
│   ├── ui/                 # BaseButton, FormField, LoadingState, EmptyState, ErrorState, ...
│   ├── layout/             # AppHeader, AppFooter, BalanceChip, AuthCard, SetupNotice
│   ├── games/              # GameCard, BetInput, RoundResult, PlayingCard + one component per game
│   ├── admin/              # GameForm, PromotionForm, PlayerRow
│   ├── promotions/, profile/, referrals/
└── views/                  # PAGES (one per route)
    ├── HomeView, GamesView, GameView, PromotionsView, LeaderboardView, ProfileView,
    ├── LoginView, RegisterView, ForbiddenView, NotFoundView
    └── admin/              # AdminLayout + dashboard, games, promotions, players, bets
shared/                     # used by BOTH the Vue app and the Function
├── rules.js                # starting balance, bonuses, stake + username validation
└── games/                  # PURE GAME LOGIC (no Vue, no Appwrite, fully unit tested)
    ├── rng.js              # crypto-secure random numbers
    └── slots.js, roulette.js, blackjack.js, dice.js, coinflip.js, payout.js
functions/casino/           # APPWRITE FUNCTION – the server-side game engine
└── src/
    ├── main.js             # entry point: trusted user ID, body parsing, safe errors
    ├── handler.js          # allow-list of actions
    ├── appwriteDb.js       # tiny adapter over the server SDK (get/create/update/atomic increment)
    └── actions/            # wallet.js, games.js, blackjack.js, profile.js, rewards.js
scripts/
├── schema.js               # database schema + permissions + Function settings as data
├── setup-appwrite.js       # creates everything in Appwrite from schema.js
├── deploy-function.js      # packs and deploys functions/casino
└── set-role.js             # gives a user the admin / editor label
tests/                      # Vitest: game rules, UI logic, and attacks against the Function
docs/                       # SECURITY.md, AI-USAGE.md
```

**Rule of thumb used in the project**

- *View* = page, puts components together and decides what happens on success/error.
- *Component* = UI piece, receives props, emits events.
- *Composable* = reusable stateful logic (`useBet`, `useForm`, `useAsync`).
- *Service* = talks to Appwrite. Components never import the SDK directly.
- *shared/games/* = pure functions without Vue or Appwrite → easy to test, used by the server to play and by the UI to display paytables.
- *Function* = the only code that may change chips.

---

## Data model (Appwrite TablesDB, database `casino`)

```
games (1) ──< bets >── (1) profiles (= Appwrite user)
promotions (1) ──< claims >── (1) profiles
profiles (1) ──< profiles.referredBy        (who invited whom)
profiles (1) ──< referralRewards >── (1) profiles (the friend)
games.imageId ──> Storage bucket "game-images"
```

| Table | Columns | Notes |
| --- | --- | --- |
| `games` | name, type (enum), description, minBet, maxBet, isActive, imageId | `imageId` references a file in Storage |
| `promotions` | title, description, bonusAmount, startsAt, endsAt, isActive | |
| `profiles` | username (unique), balance (min 0), totalWagered, totalWon, gamesPlayed, referredBy | **row ID = Appwrite user ID** (1:1 with the account); `referredBy` = ID of the inviter |
| `bets` | userId, username, gameId, gameName, gameType, amount, payout, outcome | `$createdAt` is the time of the round |
| `claims` | userId, promotionId, amount | **unique index** on (userId, promotionId) |
| `referralRewards` | userId (inviter), referredId (friend), referredName, amount | **unique index** on referredId → one reward per friend |
| `blackjackRounds` | gameId, stake, status, open, result, payout, deck, player, dealer | the running hand, **row ID = user ID**; no permissions at all – only the Function can read it |

**Why references by ID and some copied fields?** `bets` stores `gameName` and `username` next to the IDs.
A bet is a historical record – if a game is renamed or deleted later, the history must still show what was
played. It also means the bet list needs only one query.

---

## Users, roles and security

Full details, the attack list and how to demo it: **[docs/SECURITY.md](docs/SECURITY.md)**.

Roles are **Appwrite user labels** (`admin`, `editor`). Labels can only be set with a server API key
(`npm run set-role`), so a player can never promote themselves.

Protection works in **four layers** – only the last two are real security, the first two are for usability:

1. **UI** – `lib/roles.js` decides which buttons are shown (e.g. *Delete* only for admins).
2. **Router** – `router/index.js` guard checks `meta.requiresAuth` and `meta.roles` before every navigation.
3. **Database permissions** – `scripts/schema.js`. Players can only **read**. Even a direct API call is refused.
4. **Appwrite Function `casino`** – the only code that changes chips. It takes the user ID from Appwrite
   (not from the request), validates every input, draws the result with a crypto RNG and changes the balance
   atomically.

| Table | Guest | Player | Editor | Admin |
| --- | --- | --- | --- | --- |
| games, promotions | read | read | read, create, update | everything |
| profiles | – | read | read | read, update, delete |
| bets, claims, referralRewards | – | read **own** rows | read own rows | read all, delete |
| blackjackRounds | – | – | – | – (Function only) |
| Storage `game-images` | read | read | upload/replace/delete | everything |

Extra safety in the database itself:
- `profiles.balance` has `min: 0`, and stakes are taken with an atomic decrement → parallel bets can't overspend.
- Nobody has update permission on `bets` → history can't be changed.
- Unique indexes on `claims` and `referralRewards.referredId` → nothing can be claimed twice, even with parallel requests.
- Unique index on `profiles.username` → nobody can pose as another player on the leaderboard.

---

## UX states

Every page that loads data uses the `useAsync` composable and shows one of:
**loading** (`LoadingState`), **error with retry** (`ErrorState`), **empty** (`EmptyState`) or the data.
Actions give feedback through toasts; destructive actions ask for confirmation in an accessible `<dialog>`.
Forms validate on blur and on submit, inputs are linked to their error messages (`aria-describedby`),
and there is a skip link, visible focus styles and `prefers-reduced-motion` support.

---

## Tests

```bash
npm test
```
Covers:
- **Security of the Function** ([tests/server.test.js](tests/server.test.js)) – each test is an attack: faked payouts,
  invalid stakes, parallel bets, hidden games, peeking at the blackjack deck, paying a hand twice, double claims,
  expired promotions, invite rewards for strangers, self-invites, username injection. The tests run the real
  Function code against an in-memory database that behaves like Appwrite (unique indexes, atomic decrement).
- **Function entry point** – not logged in, invalid JSON, oversized body, unknown action.
- **Game rules** – slot payouts, roulette bets, blackjack hand values, dice odds, payout rounding.
- **UI logic** – stake validation, bet statistics, role → permission mapping, form rules, safe login redirect,
  invite-friends progress, loading/creating the profile (Appwrite layer replaced by `vi.mock`).
