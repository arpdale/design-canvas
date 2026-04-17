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
  await page.mouse.move(0, 0)
  await page.waitForTimeout(50)
}

/**
 * Drag source to a named gap. Gaps are always in the DOM (collapsed to
 * zero size when idle), so their y-position is resolvable upfront — no
 * need to pause mid-drag. This keeps the sequence as a single continuous
 * mouse gesture, which CI handles reliably.
 */
async function dragToGap(page: Page, source: Locator, gapTestId: string) {
  await source.scrollIntoViewIfNeeded().catch(() => {})
  const srcBox = await source.boundingBox()
  await page.getByTestId(gapTestId).scrollIntoViewIfNeeded().catch(() => {})
  const gapBox = await page.getByTestId(gapTestId).boundingBox()
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

async function startFresh(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

function canvasPane(page: Page) {
  return page.getByTestId('panel-canvas')
}

function canvasRoot(page: Page): Locator {
  return page.locator(
    '[data-testid="canvas-empty"], [data-testid="canvas-surface"]'
  )
}

async function addButton(page: Page, label: string) {
  await dragFromTo(page, page.getByTestId('panel-item-Button'), canvasRoot(page))
  await page.getByTestId('prop-input-children').fill(label)
}

async function buttonOrder(page: Page) {
  return await canvasPane(page)
    .locator('button[data-slot="button"]')
    .allTextContents()
}

test.describe('reorder + insertion indicators', () => {
  test('drag a panel item onto a root gap inserts at that index', async ({
    page,
  }) => {
    await startFresh(page)
    await addButton(page, 'First')
    await addButton(page, 'Second')
    await addButton(page, 'Third')
    expect(await buttonOrder(page)).toEqual(['First', 'Second', 'Third'])

    await dragToGap(
      page,
      page.getByTestId('panel-item-Separator'),
      'gap-root-1'
    )

    const separator = canvasPane(page).locator('[data-node-type="Separator"]')
    await expect(separator).toHaveCount(1)
    expect(await buttonOrder(page)).toEqual(['First', 'Second', 'Third'])

    const types = await canvasPane(page)
      .locator('[data-node-type]')
      .evaluateAll((els: HTMLElement[]) =>
        els.map((e) => e.dataset.nodeType!)
      )
    const sepIdx = types.indexOf('Separator')
    expect(sepIdx).toBeGreaterThan(0)
    expect(types.slice(0, sepIdx).filter((t) => t === 'Button')).toHaveLength(1)
  })

  test('drag an existing root node to an earlier gap reorders siblings', async ({
    page,
  }) => {
    await startFresh(page)
    await addButton(page, 'A')
    await addButton(page, 'B')
    await addButton(page, 'C')
    expect(await buttonOrder(page)).toEqual(['A', 'B', 'C'])

    const cWrapper = canvasPane(page)
      .locator('[data-node-type="Button"]')
      .filter({ hasText: 'C' })
    await dragToGap(page, cWrapper, 'gap-root-0')

    expect(await buttonOrder(page)).toEqual(['C', 'A', 'B'])
  })

  test('reordering within the same parent preserves intent (A B C → A C B)', async ({
    page,
  }) => {
    await startFresh(page)
    await addButton(page, 'A')
    await addButton(page, 'B')
    await addButton(page, 'C')

    const bWrapper = canvasPane(page)
      .locator('[data-node-type="Button"]')
      .filter({ hasText: 'B' })
    await dragToGap(page, bWrapper, 'gap-root-3')

    expect(await buttonOrder(page)).toEqual(['A', 'C', 'B'])
  })
})
