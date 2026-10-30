// Database schema + permissions, described as plain data.
// scripts/setup-appwrite.js reads this file and creates everything in Appwrite.
import { Permission, Role } from 'node-appwrite'

const admin = Role.label('admin')
const editor = Role.label('editor')

export const DATABASE = { id: 'casino', name: 'Royal Chip Casino' }

const GAME_TYPES = ['slots', 'roulette', 'blackjack', 'dice', 'coinflip']

export const TABLES = [
  {
    id: 'games',
    name: 'Games',
    // Everyone (even guests) can read games. Admins + editors can create/update. Only admins can delete.
    rowSecurity: false,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(admin),
      Permission.create(editor),
      Permission.update(admin),
      Permission.update(editor),
      Permission.delete(admin)
    ],
    columns: [
      { type: 'varchar', key: 'name', size: 60, required: true },
      { type: 'enum', key: 'type', elements: GAME_TYPES, required: true },
      { type: 'text', key: 'description', required: false },
      { type: 'integer', key: 'minBet', required: true, min: 1 },
      { type: 'integer', key: 'maxBet', required: true, min: 1 },
      { type: 'boolean', key: 'isActive', required: false, xdefault: true },
      { type: 'varchar', key: 'imageId', size: 36, required: false }
    ],
    indexes: [
      { key: 'name_search', type: 'fulltext', columns: ['name'] },
      { key: 'name_sort', type: 'key', columns: ['name'] },
      { key: 'type_idx', type: 'key', columns: ['type'] },
      { key: 'active_idx', type: 'key', columns: ['isActive'] }
    ]
  },
  {
    id: 'promotions',
    name: 'Promotions',
    rowSecurity: false,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(admin),
      Permission.create(editor),
      Permission.update(admin),
      Permission.update(editor),
      Permission.delete(admin)
    ],
    columns: [
      { type: 'varchar', key: 'title', size: 80, required: true },
      { type: 'varchar', key: 'description', size: 500, required: true },
      { type: 'integer', key: 'bonusAmount', required: true, min: 1, max: 100000 },
      { type: 'datetime', key: 'startsAt', required: true },
      { type: 'datetime', key: 'endsAt', required: true },
      { type: 'boolean', key: 'isActive', required: false, xdefault: true }
    ],
    indexes: [
      { key: 'active_idx', type: 'key', columns: ['isActive'] },
      { key: 'starts_idx', type: 'key', columns: ['startsAt'] },
      { key: 'ends_idx', type: 'key', columns: ['endsAt'] }
    ]
  },
  {
    id: 'profiles',
    name: 'Player profiles',
    // Row security ON: the row itself says who may update it (the owner).
    // Table level: any logged-in user can create their profile and read profiles (leaderboard),
    // admins can update/delete every profile.
    rowSecurity: true,
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(admin),
      Permission.delete(admin)
    ],
    columns: [
      { type: 'varchar', key: 'username', size: 30, required: true },
      // min: 0 -> the database itself refuses a negative balance
      { type: 'integer', key: 'balance', required: true, min: 0 },
      { type: 'integer', key: 'totalWagered', required: false, min: 0, xdefault: 0 },
      { type: 'integer', key: 'totalWon', required: false, min: 0, xdefault: 0 },
      { type: 'integer', key: 'gamesPlayed', required: false, min: 0, xdefault: 0 }
    ],
    indexes: [
      { key: 'username_idx', type: 'key', columns: ['username'] },
      { key: 'won_idx', type: 'key', columns: ['totalWon'] }
    ]
  },
  {
    id: 'bets',
    name: 'Bets',
    // Players can create bets and read only their own (row permission). Nobody but admins
    // can delete, and nobody can update -> the history cannot be edited.
    rowSecurity: true,
    permissions: [Permission.create(Role.users()), Permission.read(admin), Permission.delete(admin)],
    columns: [
      { type: 'varchar', key: 'userId', size: 36, required: true },
      { type: 'varchar', key: 'username', size: 30, required: true },
      { type: 'varchar', key: 'gameId', size: 36, required: true },
      { type: 'varchar', key: 'gameName', size: 60, required: true },
      { type: 'enum', key: 'gameType', elements: GAME_TYPES, required: true },
      { type: 'integer', key: 'amount', required: true, min: 1 },
      { type: 'integer', key: 'payout', required: true, min: 0 },
      { type: 'varchar', key: 'outcome', size: 255, required: true }
    ],
    indexes: [
      { key: 'user_idx', type: 'key', columns: ['userId'] },
      { key: 'gametype_idx', type: 'key', columns: ['gameType'] },
      { key: 'game_idx', type: 'key', columns: ['gameId'] }
    ]
  },
  {
    id: 'claims',
    name: 'Promotion claims',
    rowSecurity: true,
    permissions: [Permission.create(Role.users()), Permission.read(admin), Permission.delete(admin)],
    columns: [
      { type: 'varchar', key: 'userId', size: 36, required: true },
      { type: 'varchar', key: 'promotionId', size: 36, required: true },
      { type: 'integer', key: 'amount', required: true, min: 0 }
    ],
    indexes: [
      // UNIQUE: one claim per user and promotion – enforced by the database
      { key: 'user_promo_unique', type: 'unique', columns: ['userId', 'promotionId'] },
      { key: 'user_idx', type: 'key', columns: ['userId'] }
    ]
  }
]

export const BUCKET = {
  id: 'game-images',
  name: 'Game images',
  permissions: [
    Permission.read(Role.any()),
    Permission.create(admin),
    Permission.create(editor),
    Permission.update(admin),
    Permission.update(editor),
    Permission.delete(admin),
    Permission.delete(editor)
  ],
  maximumFileSize: 2 * 1024 * 1024,
  allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif']
}

const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString()

export const SEED = {
  games: [
    { name: 'Lucky Sevens', type: 'slots', minBet: 10, maxBet: 500, description: 'Classic three-reel slot. Hit three 7s for a 100× jackpot!' },
    { name: 'Diamond Rush', type: 'slots', minBet: 50, maxBet: 2000, description: 'High-stakes slot for players who like big spins.' },
    { name: 'European Roulette', type: 'roulette', minBet: 10, maxBet: 1000, description: 'Single-zero wheel. Bet on colours, dozens or a single number.' },
    { name: 'Classic Blackjack', type: 'blackjack', minBet: 20, maxBet: 1000, description: 'Beat the dealer to 21. Blackjack pays 3:2.' },
    { name: 'Hi-Lo Dice', type: 'dice', minBet: 5, maxBet: 500, description: 'Choose your own risk: roll over or under your target.' },
    { name: 'Golden Coin', type: 'coinflip', minBet: 5, maxBet: 1000, description: 'Heads or tails? The simplest 50/50 in the house.' }
  ].map((g) => ({ ...g, isActive: true, imageId: null })),
  promotions: [
    { title: 'Welcome Bonus', description: 'A little extra to get you started. Claim once per account.', bonusAmount: 500, startsAt: inDays(-1), endsAt: inDays(60), isActive: true },
    { title: 'Weekend Spins', description: 'Free chips for the weekend – try the new Diamond Rush slot!', bonusAmount: 250, startsAt: inDays(-1), endsAt: inDays(14), isActive: true },
    { title: 'High Roller Club', description: 'Coming soon: a bonus for our biggest players.', bonusAmount: 2000, startsAt: inDays(7), endsAt: inDays(37), isActive: true }
  ]
}
