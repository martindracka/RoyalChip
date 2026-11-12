// Cryptographically secure random integer in [0, max).
// Better than Math.random() because the numbers are not predictable.
export function randomInt(max) {
  const buf = new Uint32Array(1)
  const limit = Math.floor(0x100000000 / max) * max // avoids modulo bias
  do {
    crypto.getRandomValues(buf)
  } while (buf[0] >= limit)
  return buf[0] % max
}
