import { test, expect, type Page, type Locator } from '@playwright/test'

async function dragFromTo(page: Page, source: Locator, target: Locator) {
  const srcBox = await source.boundingBox()
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

async function startFresh(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

test.describe('sidebar tabs + layers', () => {
  test('tabs are visible; starts on Components', async ({ page }) => {
    await startFresh(page)
    await expect(page.getByTestId('sidebar-tab-components')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(page.getByTestId('sidebar-tab-layers')).toHaveAttribute(
      'aria-selected',
      'false'
    )
    await expect(page.getByTestId('component-panel')).toBeVisible()
  })

  test('switching to Layers shows a tree of the current composition', async ({
    page,
  }) => {
    await startFresh(page)
    // Add a Card (auto-seeds Header/Title/Description/Content)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Card'),
      page.getByTestId('canvas-empty')
    )
    await expect(
      page.getByTestId('panel-canvas').locator('[data-node-type="Card"]')
    ).toHaveCount(1)

    await page.getByTestId('sidebar-tab-layers').click()

    // Layers panel lists each node in the tree
    const layers = page.getByTestId('layers-panel')
    await expect(layers).toBeVisible()
    await expect(layers.getByText('Card', { exact: true })).toBeVisible()
    await expect(layers.getByText('CardHeader')).toBeVisible()
    await expect(layers.getByText('CardContent')).toBeVisible()
    await expect(layers.getByText('CardTitle')).toBeVisible()
  })

  test('clicking a layer selects it in the canvas', async ({ page }) => {
    await startFresh(page)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Card'),
      page.getByTestId('canvas-empty')
    )

    // Open Layers
    await page.getByTestId('sidebar-tab-layers').click()

    // Click CardHeader in the tree
    await page.getByTestId('layers-panel').getByText('CardHeader').click()

    // Inspector should now show CardHeader
    await expect(page.getByTestId('inspector-panel')).toContainText(
      'CardHeader'
    )
  })

  test('selection made on canvas reflects in Layers tab', async ({ page }) => {
    await startFresh(page)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Button'),
      page.getByTestId('canvas-empty')
    )
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    // Switch to Layers. The Button was auto-selected on insert.
    await page.getByTestId('sidebar-tab-layers').click()

    // The Button row should have the selected style (bg-blue-50)
    const buttonRow = page.getByTestId('layers-panel').getByText('Button')
    // Walk up to the <button> (layer row) to inspect its class
    const layerRow = buttonRow.locator('xpath=ancestor::button[1]')
    await expect(layerRow).toHaveClass(/bg-blue-50/)
  })
})
