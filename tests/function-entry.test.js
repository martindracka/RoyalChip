// Tests the entry point of the Appwrite Function (functions/casino/src/main.js)
// with fake req/res objects, like Appwrite would call it.
import { describe, it, expect, beforeAll } from 'vitest'
import main from '../functions/casino/src/main.js'

beforeAll(() => {
  process.env.APPWRITE_FUNCTION_API_ENDPOINT = 'https://example.appwrite.io/v1'
  process.env.APPWRITE_FUNCTION_PROJECT_ID = 'test'
})

function run({ headers = {}, body = '' } = {}) {
  let response
  const res = { json: (data, status = 200) => (response = { status, data }) }
  return main({ req: { headers, bodyText: body }, res, error: () => {} }).then(() => response)
}

const loggedIn = { 'x-appwrite-user-id': 'alice', 'x-appwrite-key': 'dynamic-key' }

describe('casino function entry point', () => {
  it('refuses callers who are not logged in', async () => {
    expect((await run({ body: '{"action":"game.play"}' })).status).toBe(401)
  })

  it('refuses invalid JSON and oversized bodies', async () => {
    expect((await run({ headers: loggedIn, body: '{not json' })).status).toBe(400)
    expect((await run({ headers: loggedIn, body: 'x'.repeat(5000) })).status).toBe(400)
  })

  it('answers an unknown action with a safe message', async () => {
    const response = await run({ headers: loggedIn, body: JSON.stringify({ action: 'admin.giveMeChips' }) })
    expect(response).toEqual({ status: 400, data: { error: 'Unknown action' } })
  })
})
