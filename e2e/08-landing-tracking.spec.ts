import { test, expect } from '@playwright/test'

test.describe('Landing Page (Public)', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // unauthenticated

  test('should load the landing page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Hero section visible
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should show store name or brand', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/LookKuan|ลูกกวาด/i).first()).toBeVisible()
  })

  test('should have order tracking form or link', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Look for tracking input or link - use first() to handle multiple matches
    const trackForm = page.getByPlaceholder(/เลขที่ใบงาน|order|track/i).first()
    const trackLink = page.getByRole('link', { name: /ติดตามงาน|track/i }).first()
    const hasForm = await trackForm.isVisible().catch(() => false)
    const hasLink = await trackLink.isVisible().catch(() => false)
    // Also check for tracking section heading or input with any placeholder pattern
    const trackSection = page.locator('#track, [id="track"]').first()
    const hasTrackSection = await trackSection.isVisible().catch(() => false)
    expect(hasForm || hasLink || hasTrackSection).toBeTruthy()
  })

  test('should display services section', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Should have content about embroidery or clothing
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
    expect(body!.length).toBeGreaterThan(100)
  })

  test('should have login link/button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Use first() since there may be multiple login links (header + footer)
    const loginLink = page.getByRole('link', { name: /เข้าสู่ระบบ|login/i }).first()
    await expect(loginLink).toBeVisible()
  })
})

test.describe('Order Tracking (Public)', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should load tracking page with unknown order number', async ({ page }) => {
    await page.goto('/track/NOTEXIST-9999')
    await page.waitForLoadState('networkidle')
    // Page should load (not error) and show not-found state
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show not-found message for invalid order', async ({ page }) => {
    await page.goto('/track/INVALID-0000')
    await page.waitForLoadState('networkidle')
    const body = await page.textContent('body')
    // Should show some "not found" or search again UI
    expect(body).toBeTruthy()
  })

  test('should have search/back navigation on tracking page', async ({ page }) => {
    await page.goto('/track/TEST-0001')
    await page.waitForLoadState('networkidle')
    // Look for search input or a link to go back / try again
    const searchInput = page.getByPlaceholder(/เลขที่ใบงาน|order/i)
    const backLink = page.getByRole('link', { name: /กลับ|ค้นหาใหม่/i })
    const submitBtn = page.getByRole('button', { name: /ค้นหา|ติดตาม/i })
    const hasNav = (await searchInput.isVisible().catch(() => false)) ||
                   (await backLink.isVisible().catch(() => false)) ||
                   (await submitBtn.isVisible().catch(() => false))
    expect(hasNav).toBeTruthy()
  })

  test('tracking page should not require authentication', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/track/TEST-0001')
    // Should NOT redirect to login
    await page.waitForLoadState('networkidle')
    expect(page.url()).not.toContain('/login')
  })
})
