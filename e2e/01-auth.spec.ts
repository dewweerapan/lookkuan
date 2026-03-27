import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test('should login with valid email and password', async ({ page }) => {
      await page.goto('/login')

      // Check page loaded
      await expect(page.getByText('LookKuan')).toBeVisible()

      // Fill form
      await page.getByLabel('อีเมล').fill('jizrix@gmail.com')
      await page.getByLabel('รหัสผ่าน').fill('test123456')

      // Submit
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

      // Should redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 15000 })
      await expect(page.getByText('หน้าหลัก')).toBeVisible()
    })

    test('should show error with wrong password', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('อีเมล').fill('jizrix@gmail.com')
      await page.getByLabel('รหัสผ่าน').fill('wrongpassword')
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

      // Wait for error message
      await expect(
        page.getByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      ).toBeVisible({ timeout: 10000 })

      // Should still be on login page
      await expect(page.url()).toContain('/login')
    })

    test('should show error with wrong email', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('อีเมล').fill('nonexistent@example.com')
      await page.getByLabel('รหัสผ่าน').fill('test123456')
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

      await expect(
        page.getByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      ).toBeVisible({ timeout: 10000 })

      await expect(page.url()).toContain('/login')
    })

    test('should require email field', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('รหัสผ่าน').fill('test123456')
      const submitButton = page.getByRole('button', { name: 'เข้าสู่ระบบ' })

      // HTML5 validation should prevent submission
      await submitButton.click()
      await expect(page.url()).toContain('/login')
    })

    test('should require password field', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('อีเมล').fill('jizrix@gmail.com')
      const submitButton = page.getByRole('button', { name: 'เข้าสู่ระบบ' })

      await submitButton.click()
      await expect(page.url()).toContain('/login')
    })

    test('should show PIN login link', async ({ page }) => {
      await page.goto('/login')

      const pinLink = page.getByRole('link', { name: /เข้าสู่ระบบด้วยรหัส PIN/ })
      await expect(pinLink).toBeVisible()
      await expect(pinLink).toHaveAttribute('href', '/pin-login')
    })
  })

  test.describe('Protected Routes', () => {
    // These tests should run without saved auth state
    test('unauthenticated user redirected to login', async ({ page, context }) => {
      // Clear any saved auth state
      await context.clearCookies()

      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/login|\/pin-login/, { timeout: 10000 })
    })
  })

  test.describe('Session', () => {
    test('authenticated user can access dashboard', async ({ page }) => {
      // This test uses the saved auth state from auth.setup.ts
      await page.goto('/dashboard')

      await expect(page.getByText('หน้าหลัก')).toBeVisible()
    })

    test('can navigate between authenticated routes', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page.getByText('หน้าหลัก')).toBeVisible()

      // Navigate to inventory
      await page.goto('/inventory')
      await expect(page.getByText('สินค้าและสต็อก')).toBeVisible()

      // Navigate to POS
      await page.goto('/pos')
      await page.waitForLoadState('networkidle')

      // Navigate to job orders
      await page.goto('/job-orders')
      await expect(page.getByText('งานปักเสื้อ')).toBeVisible()
    })
  })
})
