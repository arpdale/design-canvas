import { test, expect } from '@playwright/test'

test.describe('canvas render (M5)', () => {
  test('login seed renders with real DS components', async ({ page }) => {
    await page.goto('/')

    // Three panes mounted
    await expect(page.getByTestId('topbar')).toContainText('Design Canvas')
    await expect(page.getByTestId('panel-components')).toBeVisible()
    await expect(page.getByTestId('panel-canvas')).toBeVisible()
    await expect(page.getByTestId('panel-inspector')).toBeVisible()

    // Seeded login content is rendered as real DS components
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByText('Sign in to your account.')).toBeVisible()
    await expect(
      page.locator('input[placeholder="you@domain.com"]')
    ).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('clicking a rendered component selects it (edit-mode interception)', async ({
    page,
  }) => {
    await page.goto('/')
    const signInButton = page.getByRole('button', { name: 'Sign in' })
    await expect(signInButton).toBeVisible()

    // The wrapper around the button carries data-node-type
    const wrapper = page
      .locator('[data-node-type="Button"]')
      .filter({ hasText: 'Sign in' })
    await wrapper.click()

    // Selection outline is applied
    await expect(wrapper).toHaveClass(/outline-blue-500/)
  })

  test('panel items are visible and carry drag affordance', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('panel-item-Button')).toBeVisible()
    await expect(page.getByTestId('panel-item-Input')).toBeVisible()
    await expect(page.getByTestId('panel-item-Card')).toBeVisible()
  })
})
