export function formatChips(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}

export function formatDate(iso) {
  if (!iso) return '–'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in local time
export function toDateInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

export const GAME_TYPES = [
  { value: 'slots', label: 'Slots', icon: '🎰' },
  { value: 'roulette', label: 'Roulette', icon: '🎡' },
  { value: 'blackjack', label: 'Blackjack', icon: '🃏' },
  { value: 'dice', label: 'Dice', icon: '🎲' },
  { value: 'coinflip', label: 'Coin Flip', icon: '🪙' }
]

export function gameTypeInfo(type) {
  return GAME_TYPES.find((t) => t.value === type) || { value: type, label: type, icon: '🎮' }
}
