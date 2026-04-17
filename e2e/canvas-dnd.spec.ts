import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * dnd-kit's PointerSensor requires real pointer events with movement past
 * the activation distance (4px). Playwright's default mouse DnD fires
 * mouse events that dnd-kit interprets correctly in most setups; this
 * helper nudges with small intermediate steps so the sensor activates
 * reliably in CI.
 */
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
  // intermediate moves to pass the 4px activation constraint
  await page.mouse.move(startX + 10, startY + 10, { steps: 5 })
  await page.mouse.move(endX, endY, { steps: 10 })
  await page.mouse.up()
}

test.describe('drag-to-add', () => {
  test('drag Button from panel onto empty canvas inserts a root', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('canvas-empty')).toBeVisible()

    const source = page.getByTestId('panel-item-Button')
    const target = page.getByTestId('canvas-empty')
    await dragFromTo(page, source, target)

    // Canvas is no longer empty; a Button was inserted
    await expect(page.getByTestId('canvas-empty')).toHaveCount(0)
    const rendered = page.locator('[data-node-type="Button"]')
    await expect(rendered).toHaveCount(1)
    await expect(rendered).toContainText('Button')
  })

  test('drag Card inserts a pre-seeded Card + Header + Content subtree', async ({
    page,
  }) => {
    await page.goto('/')
    const source = page.getByTestId('panel-item-Card')
    const target = page.getByTestId('canvas-empty')
    await dragFromTo(page, source, target)

    await expect(page.locator('[data-node-type="Card"]')).toHaveCount(1)
    await expect(page.locator('[data-node-type="CardHeader"]')).toHaveCount(1)
    await expect(page.locator('[data-node-type="CardTitle"]')).toHaveCount(1)
    await expect(page.locator('[data-node-type="CardDescription"]')).toHaveCount(
      1
    )
    await expect(page.locator('[data-node-type="CardContent"]')).toHaveCount(1)
  })

  test('drag Button onto Card nests it inside CardContent', async ({
    page,
  }) => {
    await page.goto('/')

    // 1. Add a Card
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Card'),
      page.getByTestId('canvas-empty')
    )
    await expect(page.locator('[data-node-type="CardContent"]')).toHaveCount(1)

    // 2. Drag a Button onto the CardContent
    const buttonSource = page.getByTestId('panel-item-Button')
    const cardContent = page.locator('[data-node-type="CardContent"]')
    await dragFromTo(page, buttonSource, cardContent)

    // Button is rendered inside the Card subtree
    const buttonsInCard = page
      .locator('[data-node-type="Card"]')
      .locator('[data-node-type="Button"]')
    await expect(buttonsInCard).toHaveCount(1)
  })

  test('keyboard delete removes selected node', async ({ page }) => {
    await page.goto('/')
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Button'),
      page.getByTestId('canvas-empty')
    )
    const button = page.locator('[data-node-type="Button"]')
    await expect(button).toHaveCount(1)

    // Click to select
    await button.click()
    // Outline indicates selection
    await expect(button).toHaveClass(/outline-blue-500/)

    // Delete
    await page.keyboard.press('Backspace')
    await expect(page.locator('[data-node-type="Button"]')).toHaveCount(0)
    await expect(page.getByTestId('canvas-empty')).toBeVisible()
  })
})
