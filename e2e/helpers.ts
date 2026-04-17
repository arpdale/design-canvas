import { expect, type Page, type Locator } from '@playwright/test'

/**
 * Standard drag-and-drop helper. Scrolls source + target into view
 * before computing coordinates — panel tiles with live previews are
 * tall enough to push later items off-screen, and Playwright's mouse
 * uses viewport coordinates.
 */
export async function dragFromTo(
  page: Page,
  source: Locator,
  target: Locator
) {
  await source.scrollIntoViewIfNeeded().catch(() => {})
  const srcBox = await source.boundingBox()
  await target.scrollIntoViewIfNeeded().catch(() => {})
  const tgtBox = await target.boundingBox()
  if (!srcBox || !tgtBox) throw new Error('drag targets not visible')

  const startX = srcBox.x + srcBox.width / 2
  const startY = srcBox.y + srcBox.height / 2
  const endX = tgtBox.x + tgtBox.width / 2
  const endY = tgtBox.y + tgtBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + 10, startY + 10, { steps: 5 })
  await page.mouse.move(endX, endY, { steps: 10 })
  await page.mouse.up()
  await page.mouse.move(0, 0)
  await page.waitForTimeout(50)
}

/**
 * Drag to a named gap. Gap drop zones are always in the DOM (but
 * collapsed when idle), so we can resolve their position upfront and
 * perform a single continuous drag — the most CI-reliable pattern.
 */
export async function dragToGap(
  page: Page,
  source: Locator,
  gapTestId: string
) {
  await source.scrollIntoViewIfNeeded().catch(() => {})
  const srcBox = await source.boundingBox()
  const gap = page.getByTestId(gapTestId)
  await gap.scrollIntoViewIfNeeded().catch(() => {})
  const gapBox = await gap.boundingBox()
  if (!srcBox || !gapBox) throw new Error('source or gap not locatable')

  const sx = srcBox.x + srcBox.width / 2
  const sy = srcBox.y + srcBox.height / 2
  const gx = gapBox.x + gapBox.width / 2
  const gy = gapBox.y + gapBox.height / 2

  await page.mouse.move(sx, sy)
  await page.mouse.down()
  await page.mouse.move(sx + 10, sy + 10, { steps: 5 })
  await page.mouse.move(gx, gy, { steps: 15 })
  await page.mouse.up()
  await page.mouse.move(0, 0)
  await page.waitForTimeout(50)
}

export async function startFresh(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

export function canvasPane(page: Page) {
  return page.getByTestId('panel-canvas')
}

/** Whichever of canvas-empty / canvas-surface is currently mounted. */
export function canvasRoot(page: Page): Locator {
  return page.locator(
    '[data-testid="canvas-empty"], [data-testid="canvas-surface"]'
  )
}

export { expect }
