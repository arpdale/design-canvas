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

async function startFresh(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

test.describe('export', () => {
  test('export button is disabled when canvas is empty', async ({ page }) => {
    await startFresh(page)
    await expect(page.getByTestId('export-open')).toBeDisabled()
  })

  test('export button enables after dropping a component', async ({
    page,
  }) => {
    await startFresh(page)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Button'),
      page.getByTestId('canvas-empty')
    )
    await page.mouse.move(0, 0)
    await expect(page.getByTestId('export-open')).toBeEnabled()
  })

  test('login demo: compose, export, verify generated source', async ({
    page,
  }) => {
    await startFresh(page)

    // 1. Drop a Card (auto-seeded with Header/Title/Description/Content)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Card'),
      page.getByTestId('canvas-empty')
    )
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    // 2. Drop Input into CardContent
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Input'),
      page.locator('[data-node-type="CardContent"]').first()
    )
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    // 3. Drop a Button into CardContent
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Button'),
      page.locator('[data-node-type="CardContent"]').first()
    )
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    // 4. Name it
    const nameInput = page.getByTestId('composition-name')
    await nameInput.fill('LoginPage')
    await nameInput.press('Enter')

    // 5. Open export
    await page.getByTestId('export-open').click()
    await expect(page.getByTestId('export-dialog')).toBeVisible()

    // Source contains the expected structure. Prettier may wrap the
    // import statement across lines; we only assert the key pieces are
    // present, not the exact formatting.
    const source = page.getByTestId('export-source')
    await expect(source).toContainText('@david-richard/ds-blossom')
    for (const name of [
      'Button',
      'Card',
      'CardContent',
      'CardHeader',
      'CardTitle',
      'CardDescription',
      'Input',
    ]) {
      await expect(source).toContainText(name)
    }
    await expect(source).toContainText('export function LoginPage()')
    await expect(source).toContainText('<Card>')
    await expect(source).toContainText('<Input')
    await expect(source).toContainText('<Button')

    // Dialog header shows filename
    await expect(page.getByTestId('export-dialog')).toContainText(
      'LoginPage.tsx'
    )
  })

  test('export dialog closes via the close button', async ({ page }) => {
    await startFresh(page)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Button'),
      page.getByTestId('canvas-empty')
    )
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    await page.getByTestId('export-open').click()
    await expect(page.getByTestId('export-dialog')).toBeVisible()
    await page.getByTestId('export-close').click()
    await expect(page.getByTestId('export-dialog')).toHaveCount(0)
  })
})
