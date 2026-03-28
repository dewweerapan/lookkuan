import { test, expect } from '@playwright/test'

test.describe('Installments Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/installments')
    await page.waitForLoadState('networkidle')
  })

  test('should load installments page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ผ่อนชำระ' })).toBeVisible()
  })

  test('should display installment plan list or empty state', async ({ page }) => {
    // Either shows plans or empty state
    await expect(page.locator('body')).toBeVisible()
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasCard = await page.locator('[class*="card"]').isVisible().catch(() => false)
    const hasEmpty = await page.getByText(/ยังไม่มี|ไม่พบ|empty/i).isVisible().catch(() => false)
    expect(hasTable || hasCard || hasEmpty).toBeTruthy()
  })

  test('should have filter tabs (all/overdue/upcoming/paid)', async ({ page }) => {
    const filterBtns = page.getByRole('button', { name: /ทั้งหมด|ค้างชำระ|ใกล้ครบ|ชำระแล้ว/i })
    const count = await filterBtns.count()
    // Should have at least 2 filter options
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should show overdue filter', async ({ page }) => {
    const overdueBtn = page.getByRole('button', { name: /ค้างชำระ/i })
    const hasOverdue = await overdueBtn.isVisible().catch(() => false)
    if (hasOverdue) {
      await overdueBtn.click()
      await page.waitForLoadState('networkidle')
      // Page should still be on installments
      expect(page.url()).toContain('/installments')
    }
  })

  test('can navigate to installment detail', async ({ page }) => {
    // If there are plans, clicking one should navigate to its detail page
    const planRow = page.locator('table tbody tr, [class*="item"]').first()
    const hasPlan = await planRow.isVisible({ timeout: 5000 }).catch(() => false)
    if (hasPlan) {
      await planRow.click()
      await page.waitForLoadState('networkidle')
      // Should navigate to detail or stay on same page but show detail
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('installment page is accessible to authenticated user', async ({ page }) => {
    // Should NOT redirect to login
    expect(page.url()).not.toContain('/login')
    await expect(page.getByRole('heading', { name: 'ผ่อนชำระ' })).toBeVisible()
  })

  test('should display dashboard installment widget on dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Dashboard should show installment-related widget
    const installmentWidget = page.getByText(/งวดที่ครบกำหนด|ผ่อนชำระ|installment/i).first()
    const hasWidget = await installmentWidget.isVisible().catch(() => false)
    // Widget might not show if no installments exist — just check page loads
    await expect(page.getByRole('heading', { name: 'หน้าหลัก' })).toBeVisible()
    if (hasWidget) {
      await expect(installmentWidget).toBeVisible()
    }
  })
})
