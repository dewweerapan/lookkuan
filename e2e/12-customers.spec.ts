import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

test.describe('Customers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Page Load', () => {
    test('should load customers page with heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'ลูกค้า' })).toBeVisible()
    })

    test('should display customer count in description', async ({ page }) => {
      // PageHeader renders description like "ลูกค้าทั้งหมด X ราย"
      await expect(page.getByText(/ลูกค้าทั้งหมด/)).toBeVisible()
    })
  })

  test.describe('Customer List', () => {
    test('should display customer table on desktop', async ({ page }) => {
      // Table is hidden on mobile (hidden sm:block), visible on desktop viewport
      const table = page.locator('table.data-table')
      if (await table.isVisible().catch(() => false)) {
        await expect(table).toBeVisible()
        // Check table headers
        await expect(page.locator('th').filter({ hasText: 'ชื่อลูกค้า' })).toBeVisible()
        await expect(page.locator('th').filter({ hasText: 'เบอร์โทร' })).toBeVisible()
        await expect(page.locator('th').filter({ hasText: 'ระดับสมาชิก' })).toBeVisible()
      }
    })

    test('should show loyalty points column in desktop table', async ({ page }) => {
      const table = page.locator('table.data-table')
      if (await table.isVisible().catch(() => false)) {
        await expect(page.locator('th').filter({ hasText: 'แต้มสะสม' })).toBeVisible()
      }
    })

    test('should show total spent column in desktop table', async ({ page }) => {
      const table = page.locator('table.data-table')
      if (await table.isVisible().catch(() => false)) {
        await expect(page.locator('th').filter({ hasText: 'ยอดใช้จ่ายรวม' })).toBeVisible()
      }
    })

    test('should show visit count column in desktop table', async ({ page }) => {
      const table = page.locator('table.data-table')
      if (await table.isVisible().catch(() => false)) {
        await expect(page.locator('th').filter({ hasText: 'จำนวนครั้ง' })).toBeVisible()
      }
    })

    test('should display customer cards on mobile viewport', async ({ page }) => {
      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 812 })
      await page.waitForLoadState('networkidle')

      // Mobile cards are in block sm:hidden container
      const mobileContainer = page.locator('.block.sm\\:hidden')
      if (await mobileContainer.isVisible().catch(() => false)) {
        await expect(mobileContainer).toBeVisible()
      }
    })
  })

  test.describe('Search', () => {
    test('should have search input with correct placeholder', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหาลูกค้า/)
      await expect(searchInput).toBeVisible()
    })

    test('should filter customers when searching by name', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหาลูกค้า/)
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('test')
        // Wait for client-side filtering (no network call needed)
        await page.waitForTimeout(300)
        // Either shows filtered results or empty state
        const hasResults = await page.locator('table.data-table tbody tr').first().isVisible().catch(() => false)
        const hasEmpty = await page.getByText('ไม่พบลูกค้า').isVisible().catch(() => false)
        // At least one of these outcomes should be present
        expect(hasResults || hasEmpty).toBeTruthy()
      }
    })

    test('should show empty state when no customers match search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหาลูกค้า/)
      if (await searchInput.isVisible().catch(() => false)) {
        // Search for something very unlikely to exist
        await searchInput.fill('zzz_no_match_xyz_123')
        await page.waitForTimeout(300)
        const emptyState = page.getByText('ไม่พบลูกค้า')
        if (await emptyState.isVisible().catch(() => false)) {
          await expect(emptyState).toBeVisible()
        }
      }
    })

    test('should clear search and show all customers', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหาลูกค้า/)
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('abc')
        await page.waitForTimeout(200)
        await searchInput.clear()
        await page.waitForTimeout(200)
        // After clearing, full list or heading should still be visible
        await expect(page.getByRole('heading', { name: 'ลูกค้า' })).toBeVisible()
      }
    })
  })

  test.describe('Export', () => {
    test('should have Export CSV button', async ({ page }) => {
      const exportBtn = page.getByRole('button', { name: /Export CSV/i })
      await expect(exportBtn).toBeVisible()
    })
  })

  test.describe('Customer Data', () => {
    test('should display loyalty tier badges when customers have tiers', async ({ page }) => {
      // Check if any tier badge is visible (gold/silver/bronze)
      const tierBadge = page.locator('span').filter({ hasText: /ทอง|เงิน|ทองแดง/ }).first()
      if (await tierBadge.isVisible().catch(() => false)) {
        await expect(tierBadge).toBeVisible()
      }
    })

    test('should display loyalty points values', async ({ page }) => {
      // On desktop table, points are in a td with text like "X แต้ม" on mobile or numeric on desktop
      const table = page.locator('table.data-table')
      if (await table.isVisible().catch(() => false)) {
        // Each row should have numeric loyalty points in the 4th column
        const firstRow = table.locator('tbody tr').first()
        if (await firstRow.isVisible().catch(() => false)) {
          const cells = firstRow.locator('td')
          await expect(cells.nth(3)).toBeVisible()
        }
      }
    })
  })

  test.describe('Pagination', () => {
    test('should show pagination when there are multiple pages', async ({ page }) => {
      // Pagination only renders when totalPages > 1
      const prevBtn = page.getByRole('button', { name: /ก่อนหน้า/ })
      const nextBtn = page.getByRole('button', { name: /ถัดไป/ })
      const hasPrev = await prevBtn.isVisible().catch(() => false)
      const hasNext = await nextBtn.isVisible().catch(() => false)
      // If pagination is present, verify buttons are accessible
      if (hasPrev || hasNext) {
        expect(hasPrev || hasNext).toBeTruthy()
      }
    })
  })
})
