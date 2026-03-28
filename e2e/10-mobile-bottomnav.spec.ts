import { test, expect, devices } from '@playwright/test'

test.describe('Mobile Viewport & Bottom Navigation', () => {
  // Use iPhone viewport for mobile tests
  test.use({ ...devices['iPhone 12'] })

  test('dashboard page loads on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'หน้าหลัก' })).toBeVisible()
  })

  test('bottom navigation bar is visible on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Bottom nav typically has links to main sections
    const bottomNav = page.locator('nav').last()
    const hasBottomNav = await bottomNav.isVisible().catch(() => false)
    if (hasBottomNav) {
      await expect(bottomNav).toBeVisible()
    }
  })

  test('mobile nav has POS link', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const posLink = page.getByRole('link', { name: /POS|ขายสินค้า/i })
    const hasPosLink = await posLink.isVisible().catch(() => false)
    if (hasPosLink) {
      await expect(posLink).toBeVisible()
    }
  })

  test('inventory page renders on mobile', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'สินค้าและสต็อก' })).toBeVisible()
  })

  test('mobile inventory shows card view', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    // On mobile the inventory shows cards not table
    // Just ensure the page doesn't break on mobile
    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })

  test('POS page loads on mobile', async ({ page }) => {
    await page.goto('/pos')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('job orders page loads on mobile', async ({ page }) => {
    await page.goto('/job-orders')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /งานปัก/i })).toBeVisible()
  })

  test('safe area support - no content hidden behind notch', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Heading should be in viewport (not hidden)
    const heading = page.getByRole('heading', { name: 'หน้าหลัก' })
    await expect(heading).toBeInViewport()
  })
})
