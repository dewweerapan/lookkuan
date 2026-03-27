import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (auth state is pre-loaded from auth.setup.ts)
    await page.goto('/dashboard')
    await expect(page.getByText('หน้าหลัก')).toBeVisible()
  })

  test('should display page title and sidebar', async ({ page }) => {
    await expect(page.getByText('หน้าหลัก')).toBeVisible()
    await expect(page.getByText('ภาพรวมร้าน LookKuan วันนี้')).toBeVisible()
  })

  test('should display stat cards', async ({ page }) => {
    // Check for all stat cards
    await expect(page.getByText('ยอดขายวันนี้')).toBeVisible()
    await expect(page.getByText('รายการขายวันนี้')).toBeVisible()
    await expect(page.getByText('งานปักที่รอดำเนินการ')).toBeVisible()
    await expect(page.getByText('สินค้าทั้งหมด')).toBeVisible()

    // Stat cards should have values (numbers, currency, etc)
    // Just verify they're present
    const statCards = page.locator('[class*="stat-card"]')
    await expect(statCards).toHaveCount(4)
  })

  test('should display quick action buttons', async ({ page }) => {
    // Check all quick action buttons exist
    await expect(page.getByRole('link', { name: /ขายสินค้า/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /รับงานปัก/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /จัดการสต็อก/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /ลูกค้า/ })).toBeVisible()
  })

  test('should navigate to POS from quick action', async ({ page }) => {
    await page.getByRole('link', { name: /ขายสินค้า/ }).click()
    await page.waitForURL('**/pos', { timeout: 10000 })
    await expect(page.url()).toContain('/pos')
  })

  test('should navigate to Job Orders from quick action', async ({ page }) => {
    await page.getByRole('link', { name: /รับงานปัก/ }).click()
    await page.waitForURL('**/job-orders/new', { timeout: 10000 })
    await expect(page.url()).toContain('/job-orders/new')
  })

  test('should navigate to Inventory from quick action', async ({ page }) => {
    await page.getByRole('link', { name: /จัดการสต็อก/ }).click()
    await page.waitForURL('**/inventory', { timeout: 10000 })
    await expect(page.url()).toContain('/inventory')
  })

  test('should navigate to Customers from quick action', async ({ page }) => {
    await page.getByRole('link', { name: /ลูกค้า/ }).click()
    await page.waitForURL('**/customers', { timeout: 10000 })
    await expect(page.url()).toContain('/customers')
  })

  test('should navigate to Reports from sales stat card', async ({ page }) => {
    // Click the "ยอดขายวันนี้" stat card
    await page.getByText('ยอดขายวันนี้').locator('..').locator('..').click()
    await page.waitForURL('**/reports', { timeout: 10000 })
    await expect(page.url()).toContain('/reports')
  })

  test('should navigate to Inventory from low stock alert link', async ({ page }) => {
    // Check if low stock alert exists first
    const lowStockAlert = page.getByText('สินค้าใกล้หมด')

    // Only run if low stock items exist
    if (await lowStockAlert.isVisible().catch(() => false)) {
      const viewAllLink = page.getByRole('link', { name: /ดูสินค้าใกล้หมดทั้งหมด/ })
      await viewAllLink.click()
      await page.waitForURL('**/inventory', { timeout: 10000 })
      await expect(page.url()).toContain('/inventory')
    }
  })

  test('should display LookKuan in sidebar', async ({ page }) => {
    // Check for sidebar navigation
    const sidebar = page.locator('aside, nav').first()
    await expect(sidebar.getByText('หน้าหลัก')).toBeVisible()
    await expect(sidebar.getByText('สินค้าและสต็อก')).toBeVisible()
    await expect(sidebar.getByText('ขายสินค้า')).toBeVisible()
    await expect(sidebar.getByText('งานปักเสื้อ')).toBeVisible()
    await expect(sidebar.getByText('ลูกค้า')).toBeVisible()
    await expect(sidebar.getByText('รายงาน')).toBeVisible()
  })

  test('should have responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Elements should still be visible (though layout may be adjusted)
    await expect(page.getByText('หน้าหลัก')).toBeVisible()
    await expect(page.getByText('ยอดขายวันนี้')).toBeVisible()
  })
})
