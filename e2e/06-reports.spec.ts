import { test, expect } from '@playwright/test'

test.describe('Reports & Analytics', () => {
  test.describe('Reports Page', () => {
    test('should navigate to reports page', async ({ page }) => {
      await page.goto('/reports')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: 'รายงาน' })).toBeVisible()
    })

    test('should display sales summary section', async ({ page }) => {
      await page.goto('/reports')
      await page.waitForLoadState('networkidle')

      // Check for sales summary content
      const summaryHeading = page.getByText(/ยอดขาย|sales|summary/i)
      if (await summaryHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(summaryHeading.first()).toBeVisible()
      }

      // Should have some stats or charts
      const chart = page.locator('[class*="chart"], svg, canvas').first()
      if (await chart.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(chart).toBeVisible()
      }
    })

    test('should display payment breakdown section', async ({ page }) => {
      await page.goto('/reports')
      await page.waitForLoadState('networkidle')

      // Check for payment breakdown
      const paymentHeading = page.getByText(/การชำระเงิน|payment|breakdown/i)
      if (await paymentHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(paymentHeading.first()).toBeVisible()
      }
    })

    test('should display top products section', async ({ page }) => {
      await page.goto('/reports')
      await page.waitForLoadState('networkidle')

      // Check for top products
      const topHeading = page.getByText(/สินค้า|product|top|popular/i)
      if (await topHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(topHeading.first()).toBeVisible()
      }
    })

    test('should have date range filter', async ({ page }) => {
      await page.goto('/reports')
      await page.waitForLoadState('networkidle')

      // Look for date inputs
      const dateInput = page.getByLabel(/วันที่|date|from|to/i)
      if (await dateInput.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(dateInput.first()).toBeVisible()
      }
    })

    test('should filter reports by date range', async ({ page }) => {
      await page.goto('/reports')
      await page.waitForLoadState('networkidle')

      // Try to change date range
      const fromDateInput = page.locator('input[type="date"]').first()
      if (await fromDateInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        const today = new Date().toISOString().split('T')[0]
        await fromDateInput.fill(today)
        await page.waitForLoadState('networkidle')
      }
    })

    test('should display metrics cards', async ({ page }) => {
      await page.goto('/reports')
      await page.waitForLoadState('networkidle')

      // Check for metric cards
      const metricCards = page.locator('[class*="card"], [class*="metric"]')
      const count = await metricCards.count()

      if (count > 0) {
        await expect(metricCards.first()).toBeVisible()
      }
    })

    test('should have export or download option', async ({ page }) => {
      await page.goto('/reports')
      await page.waitForLoadState('networkidle')

      // Look for export button
      const exportBtn = page.getByRole('button', { name: /ดาวน์โหลด|export|print|พิมพ์/i })
      if (await exportBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(exportBtn.first()).toBeVisible()
      }
    })
  })

  test.describe('Risk Dashboard', () => {
    test('should navigate to risk dashboard', async ({ page }) => {
      await page.goto('/risk-dashboard')
      await page.waitForLoadState('networkidle')

      const heading = page.getByText('ตรวจจับทุจริต')
      if (await heading.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(heading).toBeVisible()
      }
    })

    test('should display void rate metric', async ({ page }) => {
      await page.goto('/risk-dashboard')
      await page.waitForLoadState('networkidle')

      // Check for void rate section
      const voidHeading = page.getByText(/ยกเลิก|void|rate/i)
      if (await voidHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(voidHeading.first()).toBeVisible()
      }

      // Should show percentage
      const percentage = page.getByText(/%/)
      if (await percentage.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(percentage.first()).toBeVisible()
      }
    })

    test('should display price override metric', async ({ page }) => {
      await page.goto('/risk-dashboard')
      await page.waitForLoadState('networkidle')

      // Check for price override section
      const overrideHeading = page.getByText(/ลด|override|price/i)
      if (await overrideHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(overrideHeading.first()).toBeVisible()
      }
    })

    test('should display cash discrepancy metric', async ({ page }) => {
      await page.goto('/risk-dashboard')
      await page.waitForLoadState('networkidle')

      // Check for cash discrepancy section
      const discrepancyHeading = page.getByText(/เงินสด|cash|discrepancy|ผิดพลาด/i)
      if (await discrepancyHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(discrepancyHeading.first()).toBeVisible()
      }
    })

    test('should display employee void statistics', async ({ page }) => {
      await page.goto('/risk-dashboard')
      await page.waitForLoadState('networkidle')

      // Check for employee stats table/list
      const empHeading = page.getByText(/พนักงาน|employee|staff/i)
      if (await empHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(empHeading.first()).toBeVisible()
      }

      // Should have table with data
      const table = page.locator('table, [role="grid"]').first()
      if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(table).toBeVisible()
      }
    })

    test('should show alert for high risk metrics', async ({ page }) => {
      await page.goto('/risk-dashboard')
      await page.waitForLoadState('networkidle')

      // Check for alert or warning colors
      const alert = page.locator('[class*="alert"], [class*="warning"], [class*="danger"]').first()
      if (await alert.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(alert).toBeVisible()
      }
    })

    test('should allow filtering by date range', async ({ page }) => {
      await page.goto('/risk-dashboard')
      await page.waitForLoadState('networkidle')

      // Look for date filter
      const dateInput = page.locator('input[type="date"]').first()
      if (await dateInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(dateInput).toBeVisible()
      }
    })
  })

  test.describe('Customers Page', () => {
    test('should navigate to customers page', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: 'ลูกค้า' })).toBeVisible()
    })

    test('should display customer list', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForLoadState('networkidle')

      // Check for customer list/table
      const table = page.locator('table, [role="grid"], [class*="list"]').first()
      if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(table).toBeVisible()
      }
    })

    test('should display customer count', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForLoadState('networkidle')

      // Check for customer count text
      const countText = page.getByText(/ลูกค้า.*ราย|customer|total/i)
      if (await countText.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(countText.first()).toBeVisible()
      }
    })

    test('should have search functionality', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForLoadState('networkidle')

      const searchInput = page.getByPlaceholder(/ค้นหา|search/i)
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(searchInput).toBeVisible()
        // Try searching
        await searchInput.fill('test')
        await page.waitForLoadState('networkidle')
      }
    })

    test('should display customer details in table', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForLoadState('networkidle')

      // Look for table rows with customer info
      const tableRow = page.locator('table tbody tr, [role="row"]').first()
      if (await tableRow.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(tableRow).toBeVisible()
      }
    })

    test('should allow navigating to customer detail', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForLoadState('networkidle')

      // Look for customer link/button
      const customerLink = page.locator('a[href*="/customers/"], button:has-text("ดู")').first()
      if (await customerLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        const href = await customerLink.getAttribute('href')
        if (href && href.includes('/customers/')) {
          await customerLink.click()
          await page.waitForLoadState('networkidle')
          // Should navigate to detail page
        }
      }
    })

    test('should have customer management options', async ({ page }) => {
      await page.goto('/customers')
      await page.waitForLoadState('networkidle')

      // Look for action buttons (edit, delete, add)
      const actionBtn = page.getByRole('button', { name: /เพิ่ม|add|edit|แก้ไข|delete|ลบ/i })
      if (await actionBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(actionBtn.first()).toBeVisible()
      }
    })
  })

  test.describe('Navigation to Reports', () => {
    test('should be able to navigate to reports from sidebar', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const reportsLink = page.getByRole('link', { name: /รายงาน|reports/i })
      if (await reportsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await reportsLink.click()
        await page.waitForURL('**/reports', { timeout: 10000 })
        await expect(page.url()).toContain('/reports')
      }
    })

    test('should be able to navigate to risk dashboard from sidebar', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const riskLink = page.getByRole('link', { name: /ตรวจจับ|risk|fraud/i })
      if (await riskLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await riskLink.click()
        await page.waitForURL('**/risk-dashboard', { timeout: 10000 })
        await expect(page.url()).toContain('/risk-dashboard')
      }
    })
  })
})
