import { test, expect } from '@playwright/test'

test.describe('canvas boot', () => {
  test('renders three panes and an empty canvas', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('topbar')).toContainText('Design Canvas')
    await expect(page.getByTestId('panel-components')).toBeVisible()
    await expect(page.getByTestId('panel-canvas')).toBeVisible()
    await expect(page.getByTestId('panel-inspector')).toBeVisible()
    await expect(page.getByTestId('canvas-empty')).toBeVisible()
  })

  test('panel exposes Button / Input / Card tiles', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('panel-item-Button')).toBeVisible()
    await expect(page.getByTestId('panel-item-Input')).toBeVisible()
    await expect(page.getByTestId('panel-item-Card')).toBeVisible()
  })
})
