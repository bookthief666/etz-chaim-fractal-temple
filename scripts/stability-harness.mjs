import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { PATH_OPERATORS } from '../src/data/pathOperators.js'
import { REALM_SHADER_IDS } from '../src/shaders/realmRegistry.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const baseUrl = process.env.ETZ_QA_URL || 'http://127.0.0.1:4173'
const playwrightPath = '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js'
const outputDir = path.join(root, 'artifacts')
const resultPath = path.join(outputDir, 'm4.15-browser-telemetry.json')
const screenshotPath = path.join(outputDir, 'm4.15-browser-qa.png')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForServer(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // Preview server has not opened its socket yet.
    }
    await delay(180)
  }
  throw new Error(`Preview server did not become ready at ${url}`)
}

async function waitForPhase(page, phase, timeout = 20000) {
  await page.waitForFunction(
    (expected) => window.__ETZ_QA__?.snapshot?.().phase === expected,
    phase,
    { timeout },
  )
  return page.evaluate(() => window.__ETZ_QA__.snapshot())
}

async function driveRecursiveInput(page, samples = 10) {
  const stages = new Set()
  for (let index = 0; index < samples; index += 1) {
    await page.mouse.wheel(0, 360)
    await page.waitForTimeout(320)
    const report = await page.evaluate(() => window.__ETZ_QA__.snapshot())
    stages.add(Number(report.depthStage))
  }
  await page.waitForTimeout(850)
  const report = await page.evaluate(() => window.__ETZ_QA__.snapshot())
  stages.add(Number(report.depthStage))
  return { stages: [...stages], report }
}

let server = null
let browser = null

try {
  if (!process.env.ETZ_QA_URL) {
    server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    server.stdout.on('data', (chunk) => process.stdout.write(chunk))
    server.stderr.on('data', (chunk) => process.stderr.write(chunk))
  }

  await waitForServer(baseUrl)
  const playwrightModule = await import(playwrightPath)
  browser = await playwrightModule.default.chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  })
  const page = await browser.newPage({ viewport: { width: 904, height: 768 }, deviceScaleFactor: 1 })
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  await page.goto(`${baseUrl}/?qa=1`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => Boolean(window.__ETZ_QA__))
  await page.evaluate(() => window.__ETZ_QA__.enterTemple())
  await waitForPhase(page, 'TREE')

  const results = {
    harness: 'Chromium headless / SwiftShader',
    startedAt: new Date().toISOString(),
    realms: [],
    paths: [],
    contextRecovery: null,
    consoleErrors,
  }

  for (const realmId of REALM_SHADER_IDS) {
    const accepted = await page.evaluate((id) => window.__ETZ_QA__.beginRealm(id), realmId)
    if (!accepted) throw new Error(`QA API rejected realm ${realmId}`)
    const entered = await waitForPhase(page, 'REALM')
    const recursive = await driveRecursiveInput(page)
    results.realms.push({ realmId, entered, stagesObserved: recursive.stages, final: recursive.report })

    if (realmId === 'tiphareth') {
      const before = await page.evaluate(() => window.__ETZ_QA__.snapshot())
      const extensionAvailable = await page.evaluate(() => {
        const canvas = document.querySelector('canvas')
        const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl')
        const extension = gl?.getExtension('WEBGL_lose_context')
        if (!extension) return false
        window.__ETZ_CONTEXT_EXTENSION__ = extension
        extension.loseContext()
        return true
      })
      if (extensionAvailable) {
        await page.waitForFunction(() => window.__ETZ_QA__.snapshot().rendererStatus === 'restoring')
        const lost = await page.evaluate(() => window.__ETZ_QA__.snapshot())
        await page.evaluate(() => window.__ETZ_CONTEXT_EXTENSION__.restoreContext())
        await page.waitForFunction(() => ['restored', 'running'].includes(window.__ETZ_QA__.snapshot().rendererStatus), null, { timeout: 20000 })
        await page.waitForTimeout(800)
        const restored = await page.evaluate(() => window.__ETZ_QA__.snapshot())
        results.contextRecovery = { extensionAvailable, before, lost, restored }
      } else {
        results.contextRecovery = { extensionAvailable }
      }
    }

    await page.waitForTimeout(1250)
    await page.evaluate(() => window.__ETZ_QA__.returnToTree())
    await waitForPhase(page, 'TREE')
  }

  for (const operator of Object.values(PATH_OPERATORS)) {
    const accepted = await page.evaluate(
      ({ pathId, sourceId }) => window.__ETZ_QA__.beginPath(pathId, sourceId),
      { pathId: operator.id, sourceId: operator.from },
    )
    if (!accepted) throw new Error(`QA API rejected path ${operator.id}`)
    const entered = await waitForPhase(page, 'PATH')
    const recursive = await driveRecursiveInput(page, 12)
    await page.waitForFunction(() => window.__ETZ_QA__.snapshot().phase === 'REALM', null, { timeout: 25000 })
    const arrived = await page.evaluate(() => window.__ETZ_QA__.snapshot())
    results.paths.push({ pathId: operator.id, entered, stagesObserved: recursive.stages, arrived })
    await page.waitForTimeout(1250)
    await page.evaluate(() => window.__ETZ_QA__.returnToTree())
    await waitForPhase(page, 'TREE')
  }

  results.finishedAt = new Date().toISOString()
  results.final = await page.evaluate(() => window.__ETZ_QA__.snapshot())
  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(resultPath, `${JSON.stringify(results, null, 2)}\n`)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`Browser stability harness PASS: ${resultPath}`)
} finally {
  await browser?.close().catch(() => {})
  if (server) server.kill('SIGTERM')
}
