// High-resolution stock photos (Unsplash License – free to use, no attribution required).
// Images are served by the Unsplash CDN, which resizes them on the fly, so we can
// offer a srcset up to 4K (3840px) and the browser downloads only the size it needs.
const PHOTOS = {
  hero: '1596838132731-3301c3fd4317', // casino floor with slot machines
  slots: '1518895312237-a9e23508077d', // red slot machines
  roulette: '1517232115160-ff93364542dd', // roulette table with chips
  blackjack: '1511193311914-0346f16efe90', // cards on green felt
  dice: '1522069213448-443a614da9b6', // red casino dice
  coinflip: '1643393669656-3c4548dd5aa2', // gold coin
  chips: '1626775238053-4315516eedc9', // poker chips and aces
  cards: '1708919166614-60f3d21b4284', // cards, chips and dice on black
  redDice: '1568743966689-d37c04538535' // three red dice
}

const WIDTHS = [640, 1080, 1600, 2400, 3840]

export function photoUrl(key, width = 1600) {
  const id = PHOTOS[key] || PHOTOS.hero
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${width}`
}

export function photoSrcset(key) {
  return WIDTHS.map((w) => `${photoUrl(key, w)} ${w}w`).join(', ')
}

// Cover photo for a game type (used when an admin hasn't uploaded a custom image).
export function gamePhotoKey(type) {
  return PHOTOS[type] ? type : 'chips'
}
