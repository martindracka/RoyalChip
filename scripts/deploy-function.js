// Creates/updates the "casino" Appwrite Function and uploads its code.
// Used by setup-appwrite.js, or alone with:  npm run deploy:function
//
// The function imports the shared game rules from /shared, so the package keeps the repo layout:
//   package.json   functions/casino/src/...   shared/...
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { Client, Functions } from 'node-appwrite'
import { InputFile } from 'node-appwrite/file'
import { FUNCTION } from './schema.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function buildPackage() {
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'casino-fn-'))
  fs.copyFileSync(path.join(root, 'functions/casino/package.json'), path.join(stage, 'package.json'))
  fs.cpSync(path.join(root, 'functions/casino/src'), path.join(stage, 'functions/casino/src'), { recursive: true })
  fs.cpSync(path.join(root, 'shared'), path.join(stage, 'shared'), { recursive: true })

  // Relative paths only: GNU tar would read "C:\..." as a remote host name.
  const name = `casino-fn-${Date.now()}.tar.gz`
  const archive = path.join(path.dirname(stage), name)
  const result = spawnSync('tar', ['-czf', `../${name}`, '.'], { cwd: stage, stdio: 'inherit' })
  if (result.status !== 0) throw new Error('Could not create the code archive (is "tar" installed?)')
  fs.rmSync(stage, { recursive: true, force: true })
  return archive
}

async function ensureFunction(functions) {
  const settings = {
    functionId: FUNCTION.id,
    name: FUNCTION.name,
    runtime: FUNCTION.runtime,
    execute: FUNCTION.execute,
    scopes: FUNCTION.scopes,
    entrypoint: FUNCTION.entrypoint,
    commands: FUNCTION.commands,
    timeout: FUNCTION.timeout,
    logging: true
  }
  try {
    await functions.create(settings)
    console.log(`  + created function ${FUNCTION.id}`)
  } catch (error) {
    if (error.code !== 409) throw error
    await functions.update(settings) // keep permissions and scopes up to date
    console.log(`  • function ${FUNCTION.id} already exists – settings updated`)
  }
}

async function waitUntilReady(functions, deploymentId) {
  for (let i = 0; i < 90; i++) {
    const deployment = await functions.getDeployment({ functionId: FUNCTION.id, deploymentId })
    if (deployment.status === 'ready') return
    if (deployment.status === 'failed') throw new Error(`Function build failed:\n${deployment.buildLogs || ''}`)
    await sleep(2000)
  }
  throw new Error('Timed out waiting for the function build')
}

export async function deployFunction(client) {
  const functions = new Functions(client)
  await ensureFunction(functions)

  const archive = buildPackage()
  const deployment = await functions.createDeployment({
    functionId: FUNCTION.id,
    code: InputFile.fromPath(archive, 'code.tar.gz'),
    activate: true,
    entrypoint: FUNCTION.entrypoint,
    commands: FUNCTION.commands
  })
  fs.rmSync(archive, { force: true })
  console.log('  … building the function (this can take a minute)')
  await waitUntilReady(functions, deployment.$id)
  console.log('  + function deployed and active')
}

// Allow running this file directly.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env
  const client = new Client().setEndpoint(VITE_APPWRITE_ENDPOINT).setProject(VITE_APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY)
  deployFunction(client).catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
