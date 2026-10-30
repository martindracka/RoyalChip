// Gives a registered user a role by setting their Appwrite label.
// Usage:  npm run set-role -- someone@example.com admin
//         npm run set-role -- someone@example.com editor
//         npm run set-role -- someone@example.com player   (removes staff roles)
//
// Labels can ONLY be changed with a server API key – a player can never make themselves admin.
import { Client, Users, Query } from 'node-appwrite'

const ROLES = ['admin', 'editor', 'player']
const [email, role] = process.argv.slice(2)
const { VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env

if (!email || !ROLES.includes(role)) {
  console.error('Usage: npm run set-role -- <email> <admin|editor|player>')
  process.exit(1)
}

const client = new Client()
  .setEndpoint(VITE_APPWRITE_ENDPOINT)
  .setProject(VITE_APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY)
const users = new Users(client)

const { users: found } = await users.list({ queries: [Query.equal('email', email)] })
if (!found.length) {
  console.error(`❌ No user with e-mail ${email}. Register in the app first.`)
  process.exit(1)
}

const user = found[0]
await users.updateLabels({ userId: user.$id, labels: role === 'player' ? [] : [role] })
console.log(`✅ ${user.name || email} is now: ${role}. Log out and in again to see the change.`)
