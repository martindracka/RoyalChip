// An error that is safe to show to the player. Anything else becomes a generic "Server error",
// so internal details (stack traces, database messages) never reach the browser.
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const badRequest = (message) => new HttpError(400, message)
export const forbidden = (message = 'You are not allowed to do this.') => new HttpError(403, message)
export const notFound = (message = 'Not found.') => new HttpError(404, message)
export const conflict = (message) => new HttpError(409, message)
