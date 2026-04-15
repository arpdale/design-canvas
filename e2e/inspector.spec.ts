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
}

/** Scope input selectors to just the canvas pane to avoid matching the
 * inspector's own text fields. */
function canvasPane(page: Page) {
  return page.getByTestId('panel-canvas')
}

test.describe('inspector', () => {
  test('selecting a node shows its editable props', async ({ page }) => {
    await page.goto('/')
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Input'),
      page.getByTestId('canvas-empty')
    )
    await expect(page.getByTestId('inspector-panel')).toBeVisible()
    await expect(page.getByTestId('prop-field-placeholder')).toBeVisible()
    await expect(page.getByTestId('prop-field-type')).toBeVisible()
  })

  test('changing Input type to password swaps the rendered input', async ({
    page,
  }) => {
    await page.goto('/')
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Input'),
      page.getByTestId('canvas-empty')
    )

    await expect(
      canvasPane(page).locator('input[type="text"]')
    ).toHaveCount(1)

    await page.getByTestId('prop-input-type').selectOption('password')

    await expect(
      canvasPane(page).locator('input[type="password"]')
    ).toHaveCount(1)
    await expect(
      canvasPane(page).locator('input[type="text"]')
    ).toHaveCount(0)
  })

  test('editing a string prop updates the canvas live', async ({ page }) => {
    await page.goto('/')
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Button'),
      page.getByTestId('canvas-empty')
    )
    await page.getByTestId('prop-input-children').fill('Sign in')
    await expect(
      canvasPane(page)
        .locator('button[data-slot="button"]')
        .filter({ hasText: 'Sign in' })
    ).toBeVisible()
  })

  // Note: inspector delete-button behavior is covered by the unit test
  // InspectorPanel.test.tsx. Keyboard-Backspace delete is covered by the
  // canvas-dnd E2E. We don't duplicate it here.
})
