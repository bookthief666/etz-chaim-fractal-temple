import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { PATH_OPERATORS } from '../src/data/pathOperators.js'
import { REALM_SHADER_FAMILIES, REALM_SHADER_IDS } from '../src/shaders/realmRegistry.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const baseUrl = process.env.ETZ_QA_URL || 'http://127.0.0.1:4173'
const playwrightPath = '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js'
const outputDir = path.join(root, 'artifacts')
const resultPath = path.join(outputDir, 'm4.16-browser-telemetry.json')
const screenshotPath = path.join(outputDir, 'm4.16-browser-qa.png')

const VIEWPORTS = [
  { label: 'fold-open-landscape', width: 904, height: 768 },
  { label: 'fold-cover-portrait', width: 344, height: 882 },
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

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

async function waitForRollingTelemetry(page) {
  await page.waitForFunction(() => {
    const report = window.__ETZ_QA__?.snapshot?.()
    return report?.frameSampleCount >= 20 && report.frameP50Ms > 0 && report.frameP95Ms >= report.frameP50Ms
  }, null, { timeout: 12000 })
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

async function auditViewport(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  await page.waitForTimeout(300)
  const audit = await page.evaluate((label) => {
    const rootElement = document.documentElement
    const body = document.body
    const canvas = document.querySelector('canvas')
    const qa = document.querySelector('.qa-telemetry')
    const glyphs = [...document.querySelectorAll('.path-glyph-inscription')]
    const rect = (element) => {
      if (!element) return null
      const bounds = element.getBoundingClientRect()
      return {
        left: Number(bounds.left.toFixed(1)),
        top: Number(bounds.top.toFixed(1)),
        right: Number(bounds.right.toFixed(1)),
        bottom: Number(bounds.bottom.toFixed(1)),
        width: Number(bounds.width.toFixed(1)),
        height: Number(bounds.height.toFixed(1)),
      }
    }
    return {
      label,
      viewport: { width: innerWidth, height: innerHeight },
      rootScroll: { width: rootElement.scrollWidth, height: rootElement.scrollHeight },
      bodyScroll: { width: body.scrollWidth, height: body.scrollHeight },
      canvas: rect(canvas),
      qaOverlay: rect(qa),
      glyphs: glyphs.map(rect),
      touchAction: getComputedStyle(body).touchAction,
      overscrollBehavior: getComputedStyle(body).overscrollBehavior,
    }
  }, viewport.label)

  assert(audit.rootScroll.width <= audit.viewport.width + 1, `${viewport.label} has horizontal root overflow`)
  assert(audit.rootScroll.height <= audit.viewport.height + 1, `${viewport.label} has vertical root overflow`)
  assert(audit.bodyScroll.width <= audit.viewport.width + 1, `${viewport.label} has horizontal body overflow`)
  assert(audit.bodyScroll.height <= audit.viewport.height + 1, `${viewport.label} has vertical body overflow`)
  assert(audit.canvas?.width >= audit.viewport.width - 1, `${viewport.label} canvas does not cover the viewport width`)
  assert(audit.canvas?.height >= audit.viewport.height - 1, `${viewport.label} canvas does not cover the viewport height`)
  assert(audit.touchAction === 'none', `${viewport.label} body must suppress accidental browser gestures`)
  return audit
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
  const page = await browser.newPage({
    viewport: { width: VIEWPORTS[0].width, height: VIEWPORTS[0].height },
    deviceScaleFactor: 1,
  })
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  await page.goto(`${baseUrl}/?qa=1`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => Boolean(window.__ETZ_QA__))
  await page.evaluate(() => window.__ETZ_QA__.enterTemple())
  await waitForPhase(page, 'TREE')
  const treeTelemetry = await waitForRollingTelemetry(page)

  const results = {
    harness: 'M4.16 Chromium headless / SwiftShader',
    startedAt: new Date().toISOString(),
    treeTelemetry,
    viewportAudits: [],
    realms: [],
    paths: [],
    contextRecovery: null,
    consoleErrors,
  }

  const studyAccepted = await page.evaluate(() => window.__ETZ_QA__.setStudyMode())
  assert(studyAccepted, 'QA API rejected Study mode')
  await page.waitForFunction(() => document.querySelector('.app-shell')?.classList.contains('mode-study'))
  const documentaryAccepted = await page.evaluate(() => window.__ETZ_QA__.setDocumentaryMode('hermetic777'))
  assert(documentaryAccepted, 'QA API rejected 777 documentary mode')
  await page.waitForFunction(() => [...document.querySelectorAll('.mode-button[aria-pressed="true"]')]
    .some((button) => button.textContent.includes('777')))
  const sephirahAccepted = await page.evaluate(() => window.__ETZ_QA__.focusSephirah('yesod'))
  assert(sephirahAccepted, 'QA API rejected Yesod focus')
  await page.waitForFunction(() => window.__ETZ_QA__.snapshot().currentTarget === 'Yesod')
  const pathAccepted = await page.evaluate(() => window.__ETZ_QA__.focusPath('yesod__malkuth'))
  assert(pathAccepted, 'QA API rejected documentary path focus')
  await page.waitForFunction(() => Boolean(document.querySelector('.path-glyph-inscription.is-selected')))
  const hebrewIdentity = await page.evaluate(() => {
    const glyph = document.querySelector('.path-glyph-inscription.is-selected .path-glyph-letter')
    return glyph ? { text: glyph.textContent, lang: glyph.lang, direction: glyph.dir } : null
  })
  assert(
    hebrewIdentity?.text === 'ת' && hebrewIdentity.lang === 'he' && hebrewIdentity.direction === 'rtl',
    'Selected Yesod–Malkuth path did not preserve its Hebrew Tav identity',
  )
  for (const viewport of VIEWPORTS) results.viewportAudits.push(await auditViewport(page, viewport))
  await page.setViewportSize({ width: VIEWPORTS[0].width, height: VIEWPORTS[0].height })

  for (const realmId of REALM_SHADER_IDS) {
    const accepted = await page.evaluate((id) => window.__ETZ_QA__.beginRealm(id), realmId)
    if (!accepted) throw new Error(`QA API rejected realm ${realmId}`)
    const entered = await waitForPhase(page, 'REALM')
    const recursive = await driveRecursiveInput(page)
    assert(
      recursive.report.shaderProgram === REALM_SHADER_FAMILIES[realmId],
      `${realmId} did not report its canonical dedicated shader identity`,
    )
    assert(recursive.report.frameSampleCount >= 20, `${realmId} did not accumulate rolling telemetry`)
    assert(recursive.report.frameScope === `REALM:${realmId}`, `${realmId} rolling telemetry has a stale scope`)
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
    for (const sourceId of [operator.from, operator.to]) {
      const destinationId = sourceId === operator.from ? operator.to : operator.from
      const accepted = await page.evaluate(
        ({ pathId, sourceId: directedSource }) => window.__ETZ_QA__.beginPath(pathId, directedSource),
        { pathId: operator.id, sourceId },
      )
      if (!accepted) throw new Error(`QA API rejected path ${operator.id} from ${sourceId}`)
      const entered = await waitForPhase(page, 'PATH')
      const recursive = await driveRecursiveInput(page, 12)
      await page.waitForFunction(() => window.__ETZ_QA__.snapshot().phase === 'REALM', null, { timeout: 25000 })
      const arrived = await page.evaluate(() => window.__ETZ_QA__.snapshot())
      assert(arrived.currentTarget.toLowerCase().includes(destinationId), `${operator.id} did not hand off to ${destinationId}`)
      results.paths.push({ pathId: operator.id, sourceId, destinationId, entered, stagesObserved: recursive.stages, arrived })
      await page.waitForTimeout(1250)
      await page.evaluate(() => window.__ETZ_QA__.returnToTree())
      await waitForPhase(page, 'TREE')
    }
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
