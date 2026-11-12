// Chips are whole numbers, so payouts are always rounded down.
export function calcPayout(stake, multiplier) {
  return Math.floor(stake * multiplier)
}
