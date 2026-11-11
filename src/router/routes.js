import { ROLES, STAFF_ROLES } from '@/lib/roles'

// Views are lazy-loaded (code splitting) – each page is its own small JS file.
export const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/games', name: 'games', component: () => import('@/views/GamesView.vue'), meta: { title: 'Games' } },
  {
    path: '/games/:id',
    name: 'game',
    component: () => import('@/views/GameView.vue'),
    props: true,
    meta: { title: 'Play' }
  },
  {
    path: '/promotions',
    name: 'promotions',
    component: () => import('@/views/PromotionsView.vue'),
    meta: { title: 'Promotions' }
  },
  {
    // Public on purpose: guests see how the programme works, players also get their link
    path: '/invite',
    name: 'invite',
    component: () => import('@/views/ReferralsView.vue'),
    meta: { title: 'Invite friends' }
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('@/views/LeaderboardView.vue'),
    meta: { title: 'Leaderboard', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'My profile', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Log in', guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Register', guestOnly: true }
  },

  // ---------- Administration (nested routes share AdminLayout) ----------
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: STAFF_ROLES },
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('@/views/admin/AdminDashboardView.vue'),
        meta: { title: 'Admin dashboard' }
      },
      {
        path: 'games',
        name: 'admin-games',
        component: () => import('@/views/admin/AdminGamesView.vue'),
        meta: { title: 'Manage games' }
      },
      {
        path: 'games/new',
        name: 'admin-game-new',
        component: () => import('@/views/admin/AdminGameEditView.vue'),
        meta: { title: 'New game' }
      },
      {
        path: 'games/:id',
        name: 'admin-game-edit',
        component: () => import('@/views/admin/AdminGameEditView.vue'),
        props: true,
        meta: { title: 'Edit game' }
      },
      {
        path: 'promotions',
        name: 'admin-promotions',
        component: () => import('@/views/admin/AdminPromotionsView.vue'),
        meta: { title: 'Manage promotions' }
      },
      {
        path: 'promotions/new',
        name: 'admin-promotion-new',
        component: () => import('@/views/admin/AdminPromotionEditView.vue'),
        meta: { title: 'New promotion' }
      },
      {
        path: 'promotions/:id',
        name: 'admin-promotion-edit',
        component: () => import('@/views/admin/AdminPromotionEditView.vue'),
        props: true,
        meta: { title: 'Edit promotion' }
      },
      // Admin-only pages (editors are redirected to /forbidden)
      {
        path: 'players',
        name: 'admin-players',
        component: () => import('@/views/admin/AdminPlayersView.vue'),
        meta: { title: 'Players', roles: [ROLES.ADMIN] }
      },
      {
        path: 'bets',
        name: 'admin-bets',
        component: () => import('@/views/admin/AdminBetsView.vue'),
        meta: { title: 'Bet log', roles: [ROLES.ADMIN] }
      }
    ]
  },

  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { title: 'No access' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not found' }
  }
]
