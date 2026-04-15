import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Regular drag-and-drop (source → target resolved upfront).
 */
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

/**
 * Drag to a gap. Gap drop zones only render while a drag is active,
 * so we start the drag first, then query the gap's position, then
 * move to it and release.
 */
async function dragToGap(
  page: Page,
  source: Locator,
  gapTestId: string
) {
  const srcBox = await source.boundingBox()
  if (!srcBox) throw new Error('source not visible')
  const sx = srcBox.x + srcBox.width / 2
  const sy = srcBox.y + srcBox.height / 2

  await page.mouse.move(sx, sy)
  await page.mouse.down()
  // Poke past the 4px activation distance with several intermediate
  // moves — headless Chromium in CI drops some move events if they come
  // too close together, so we pace them out.
  for (let i = 1; i <= 6; i++) {
    await page.mouse.move(sx + i * 6, sy + i * 6)
    await page.waitForTimeout(20)
  }
  // Let React commit the useDndContext state update so gap drop zones
  // mount in the DOM.
  await page.waitForTimeout(250)

  const gap = page.getByTestId(gapTestId)
  await gap.waitFor({ state: 'attached', timeout: 10_000 })
  const gapBox = await gap.boundingBox()
  if (!gapBox) throw new Error(`gap ${gapTestId} not visible during drag`)
  const gx = gapBox.x + gapBox.width / 2
  const gy = gapBox.y + gapBox.height / 2

  await page.mouse.move(gx, gy, { steps: 20 })
  await page.waitForTimeout(80)
  await page.mouse.up()
  await page.mouse.move(0, 0)
  await page.waitForTimeout(150)
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

    // Drop a Separator at gap index 1 — should land between First and Second.
    // (Using Separator because it's in the Layout group near the top of the
    // panel so no scrolling is required.)
    await dragToGap(
      page,
      page.getByTestId('panel-item-Separator'),
      'gap-root-1'
    )

    const separator = canvasPane(page).locator('[data-node-type="Separator"]')
    await expect(separator).toHaveCount(1)

    expect(await buttonOrder(page)).toEqual(['First', 'Second', 'Third'])

    // DOM order: First Button, Separator, Second Button, Third Button.
    const types = await canvasPane(page)
      .locator('[data-node-type]')
      .evaluateAll((els: HTMLElement[]) =>
        els.map((e) => e.dataset.nodeType!)
      )
    const sepIdx = types.indexOf('Separator')
    expect(sepIdx).toBeGreaterThan(0)
    // Exactly one Button appears before the Separator.
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

    // Drag B to gap index 3 (after C).
    const bWrapper = canvasPane(page)
      .locator('[data-node-type="Button"]')
      .filter({ hasText: 'B' })
    await dragToGap(page, bWrapper, 'gap-root-3')

    expect(await buttonOrder(page)).toEqual(['A', 'C', 'B'])
  })
})
