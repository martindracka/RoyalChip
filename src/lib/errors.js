// Turns Appwrite / network errors into short messages a user can understand.
export function toMessage(error) {
  if (!error) return ''
  const code = error.code
  if (code === 401) return 'You do not have permission to do this. Please log in with the right account.'
  if (code === 404) return 'The requested item was not found.'
  if (code === 409) return 'This item already exists.'
  if (code === 429) return 'Too many requests. Please wait a moment and try again.'
  if (error.message === 'Failed to fetch') return 'Cannot reach the server. Check your internet connection.'
  return error.message || 'Something went wrong.'
}
