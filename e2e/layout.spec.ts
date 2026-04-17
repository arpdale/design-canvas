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

function canvasPane(page: Page) {
  return page.getByTestId('panel-canvas')
}

test.describe('layout primitives', () => {
  test('Row and Stack appear in the panel', async ({ page }) => {
    await startFresh(page)
    await expect(page.getByTestId('panel-item-Row')).toBeVisible()
    await expect(page.getByTestId('panel-item-Stack')).toBeVisible()
  })

  test('drop a Row, drop two Buttons inside, they render side-by-side', async ({
    page,
  }) => {
    await startFresh(page)

    // Drop a Row onto the empty canvas
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Row'),
      page.getByTestId('canvas-empty')
    )
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    const row = canvasPane(page).locator('[data-node-type="Row"]').first()
    await expect(row).toBeVisible()

    // Drop two Buttons into the Row
    await dragFromTo(page, page.getByTestId('panel-item-Button'), row)
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    await dragFromTo(page, page.getByTestId('panel-item-Button'), row)
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    // Two Buttons nested in the Row
    const buttonsInRow = row.locator('[data-node-type="Button"]')
    await expect(buttonsInRow).toHaveCount(2)

    // Row renders as a flex-row container — visually confirm side-by-side
    // by comparing y positions: both buttons should share the same baseline
    // (y) while having different x positions.
    const a = await buttonsInRow.nth(0).boundingBox()
    const b = await buttonsInRow.nth(1).boundingBox()
    expect(a).not.toBeNull()
    expect(b).not.toBeNull()
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(8)
    expect(b!.x).toBeGreaterThan(a!.x + a!.width - 4)
  })

  test('ButtonGroup seeds Cancel + Submit and groups them', async ({
    page,
  }) => {
    await startFresh(page)

    await dragFromTo(
      page,
      page.getByTestId('panel-item-ButtonGroup'),
      page.getByTestId('canvas-empty')
    )
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    const group = canvasPane(page).locator('[data-node-type="ButtonGroup"]')
    await expect(group).toHaveCount(1)
    const buttons = group.locator('[data-node-type="Button"]')
    await expect(buttons).toHaveCount(2)

    // Default content: Cancel + Submit
    await expect(buttons.nth(0)).toContainText('Cancel')
    await expect(buttons.nth(1)).toContainText('Submit')
  })

  test('export of Row+Buttons contains a div.flex.flex-row and does NOT import Row', async ({
    page,
  }) => {
    await startFresh(page)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Row'),
      page.getByTestId('canvas-empty')
    )
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)
    const row = canvasPane(page).locator('[data-node-type="Row"]').first()
    await dragFromTo(page, page.getByTestId('panel-item-Button'), row)
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)
    await dragFromTo(page, page.getByTestId('panel-item-Button'), row)
    await page.mouse.move(0, 0)
    await page.waitForTimeout(50)

    await page.getByTestId('export-open').click()
    const source = page.getByTestId('export-source')
    await expect(source).toBeVisible()
    // Row emits as a div with flex classes
    await expect(source).toContainText('<div className="flex flex-row')
    // Row is not imported
    const text = await source.textContent()
    expect(text).not.toMatch(/[{,]\s*Row\s*[,}]/)
    // But Button is
    expect(text).toMatch(/import \{[^}]*Button[^}]*\}/)
  })
})
