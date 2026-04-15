import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * The M10 dress rehearsal. Follows the 7-step login demo script from
 * docs/planning/product.md Definition of Done. If this test goes green,
 * the MVP thesis has been demonstrated end-to-end.
 *
 * Script:
 *   1. Empty canvas visible; drag Card onto it.
 *   2. Drop 2 Inputs into CardContent; change the second to type=password.
 *   3. Drop Button inside; rename label to "Sign in".
 *   4. Name composition "LoginPage".
 *   5. Click Export → dialog shows a well-formed .tsx.
 *   6. Reload → composition persists.
 *   7. Verify exported source compiles conceptually (check structure).
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

async function startFresh(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

function canvasPane(page: Page) {
  return page.getByTestId('panel-canvas')
}

test.describe('login demo (M10 dress rehearsal)', () => {
  test('full 7-step flow: compose → refine → name → export → reload', async ({
    page,
  }) => {
    await startFresh(page)

    // Step 1: canvas starts empty
    await expect(page.getByTestId('canvas-empty')).toContainText(
      'Your canvas is empty'
    )
    await expect(page.getByTestId('export-open')).toBeDisabled()

    // Step 2: drop a Card (seeds Header/Title/Description/Content)
    await dragFromTo(
      page,
      page.getByTestId('panel-item-Card'),
      page.getByTestId('canvas-empty')
    )
    await expect(canvasPane(page).locator('[data-node-type="Card"]')).toHaveCount(
      1
    )
    await expect(
      canvasPane(page).locator('[data-node-type="CardHeader"]')
    ).toHaveCount(1)
    await expect(
      canvasPane(page).locator('[data-node-type="CardContent"]')
    ).toHaveCount(1)

    // Step 3: rename Card title to "Welcome back"
    const cardTitle = canvasPane(page).locator('[data-node-type="CardTitle"]')
    await cardTitle.click()
    await page.getByTestId('prop-input-children').fill('Welcome back')

    // Step 4: rename Card description
    await canvasPane(page)
      .locator('[data-node-type="CardDescription"]')
      .click()
    await page.getByTestId('prop-input-children').fill('Sign in to your account.')

    // Step 5: drop two Inputs into CardContent
    const cardContent = canvasPane(page)
      .locator('[data-node-type="CardContent"]')
      .first()
    await dragFromTo(page, page.getByTestId('panel-item-Input'), cardContent)
    await dragFromTo(page, page.getByTestId('panel-item-Input'), cardContent)
    await expect(
      canvasPane(page).locator('[data-node-type="Input"]')
    ).toHaveCount(2)

    // Step 6: change the second Input's type to password
    const secondInput = canvasPane(page)
      .locator('[data-node-type="Input"]')
      .nth(1)
    await secondInput.click()
    await page.getByTestId('prop-input-type').selectOption('password')
    await page.getByTestId('prop-input-placeholder').fill('••••••••')
    await expect(
      canvasPane(page).locator('input[type="password"]')
    ).toHaveCount(1)

    // Step 7: change the first Input to email + placeholder
    await canvasPane(page).locator('[data-node-type="Input"]').first().click()
    await page.getByTestId('prop-input-type').selectOption('email')
    await page.getByTestId('prop-input-placeholder').fill('you@domain.com')

    // Step 8: drop a Button into CardContent, rename label to "Sign in"
    await dragFromTo(page, page.getByTestId('panel-item-Button'), cardContent)
    await page.getByTestId('prop-input-children').fill('Sign in')
    await expect(
      canvasPane(page)
        .locator('button[data-slot="button"]')
        .filter({ hasText: 'Sign in' })
    ).toBeVisible()

    // Step 9: name the composition "LoginPage"
    await page.getByTestId('composition-name').fill('LoginPage')
    await page.getByTestId('composition-name').press('Enter')

    // Step 10: export
    await page.getByTestId('export-open').click()
    await expect(page.getByTestId('export-dialog')).toBeVisible()
    await expect(page.getByTestId('export-filename')).toContainText(
      'LoginPage.tsx'
    )

    const source = page.getByTestId('export-source')
    const text = await source.textContent()
    expect(text).toContain('@david-richard/ds-blossom')
    expect(text).toContain('export function LoginPage()')
    expect(text).toContain('Welcome back')
    expect(text).toContain('Sign in to your account.')
    expect(text).toContain('you@domain.com')
    expect(text).toContain('••••••••')
    expect(text).toContain('Sign in')
    // Proper tag structure
    expect(text).toMatch(/<Card>/)
    expect(text).toMatch(/<CardHeader>/)
    expect(text).toMatch(/<CardTitle>Welcome back<\/CardTitle>/)
    expect(text).toMatch(/type="email"/)
    expect(text).toMatch(/type="password"/)

    // Close the dialog
    await page.getByTestId('export-close').click()
    await expect(page.getByTestId('export-dialog')).toHaveCount(0)

    // Step 11: reload — everything persists
    await page.waitForTimeout(400)
    await page.reload()
    await expect(page.getByTestId('composition-name')).toHaveValue('LoginPage')
    await expect(
      canvasPane(page).locator('[data-node-type="Card"]')
    ).toHaveCount(1)
    await expect(
      canvasPane(page).locator('input[type="password"]')
    ).toHaveCount(1)
    await expect(
      canvasPane(page)
        .locator('button[data-slot="button"]')
        .filter({ hasText: 'Sign in' })
    ).toBeVisible()
  })
})
