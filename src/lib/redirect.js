// Only allow redirects to pages INSIDE the app after login (prevents open-redirect tricks
// like ?redirect=//evil.com). Browsers treat "/\evil.com" like "//evil.com", so backslashes
// are refused too. Returns the path, or '' when it is not safe.
export function safeRedirect(value) {
  const path = typeof value === 'string' ? value : ''
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return ''
  if (/[\u0000-\u001f]/.test(path)) return '' // control characters, e.g. "/\t/evil.com"
  return path
}
