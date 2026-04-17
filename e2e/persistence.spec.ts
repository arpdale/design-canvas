import { test, expect, type Page, type Locator } from '@playwright/test'

async function dragFromTo(page: Page, source: Locator, target: Locator) {
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
}

function canvasPane(page: Page) {
  return page.getByTestId('panel-canvas')
}

/**
 * Start from a clean slate without using addInitScript (which would clear
 * storage on every subsequent reload, including ones we use to verify
 * persistence).
 */
async function startFresh(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

test.describe('persistence', () => {
  test('composition persists across page reload', async ({ page }) => {
    await startFresh(page)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Button'),
      page.getByTestId('canvas-empty')
    )
    await expect(
      canvasPane(page).locator('[data-node-type="Button"]')
    ).toHaveCount(1)

    // Let the 250ms debounce flush
    await page.waitForTimeout(400)
    await page.reload()

    await expect(
      canvasPane(page).locator('[data-node-type="Button"]')
    ).toHaveCount(1)
  })

  test('renaming the composition persists', async ({ page }) => {
    await startFresh(page)
    const name = page.getByTestId('composition-name')
    await name.fill('LoginPage')
    await name.press('Enter')

    await page.waitForTimeout(400)
    await page.reload()

    await expect(page.getByTestId('composition-name')).toHaveValue('LoginPage')
  })

  test('creating a second composition and switching keeps trees isolated', async ({
    page,
  }) => {
    await startFresh(page)

    // First composition: add a Button
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Button'),
      page.getByTestId('canvas-empty')
    )
    await expect(
      canvasPane(page).locator('[data-node-type="Button"]')
    ).toHaveCount(1)

    // Create a second composition — canvas should be empty.
    // Move cursor off the canvas so any pending pointer state from the
    // drag doesn't interfere with the topbar click; small settle wait
    // lets dnd-kit fully unwind its sensor state.
    await page.mouse.move(0, 0)
    await page.waitForTimeout(100)
    await page.getByTestId('composition-new').click()
    await expect(page.getByTestId('canvas-empty')).toBeVisible()

    // Put something different there (Badge)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Input'),
      page.getByTestId('canvas-empty')
    )
    await expect(
      canvasPane(page).locator('[data-node-type="Input"]')
    ).toHaveCount(1)

    // Switch back to the first — Button is there, Badge is not
    const switcher = page.getByTestId('composition-switcher')
    const options = await switcher.locator('option').all()
    const firstId = await options[0].getAttribute('value')
    await switcher.selectOption(firstId!)

    await expect(
      canvasPane(page).locator('[data-node-type="Button"]')
    ).toHaveCount(1)
    await expect(
      canvasPane(page).locator('[data-node-type="Input"]')
    ).toHaveCount(0)
  })
})
