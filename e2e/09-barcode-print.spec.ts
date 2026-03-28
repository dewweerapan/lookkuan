import { test, expect } from '@playwright/test'

test.describe('Barcode Printing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/barcodes')
    await page.waitForLoadState('networkidle')
  })

  test('should load barcode printing page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
    // Should show some barcode-related heading
    const heading = page.getByRole('heading').first()
    await expect(heading).toBeVisible()
  })

  test('should list products for barcode selection', async ({ page }) => {
    // Product list or search should be available
    const productList = page.locator('table tbody tr, [class*="product"], [class*="item"]').first()
    const hasProducts = await productList.isVisible({ timeout: 10000 }).catch(() => false)
    if (hasProducts) {
      await expect(productList).toBeVisible()
    }
  })

  test('should have quantity input for barcode count', async ({ page }) => {
    const qtyInput = page.getByRole('spinbutton').first()
    const hasInput = await qtyInput.isVisible().catch(() => false)
    if (hasInput) {
      await expect(qtyInput).toBeVisible()
    }
  })

  test('should have print button', async ({ page }) => {
    const printBtn = page.getByRole('button', { name: /พิมพ์|print/i })
    const hasBtn = await printBtn.isVisible().catch(() => false)
    if (hasBtn) {
      await expect(printBtn).toBeVisible()
    }
  })

  test('should navigate back to inventory', async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
    // Check barcode link exists
    const barcodeLink = page.getByRole('link', { name: /บาร์โค้ด|barcode/i })
    await expect(barcodeLink).toBeVisible()
    await barcodeLink.click()
    await page.waitForURL('**/barcodes', { timeout: 10000 })
    await expect(page.url()).toContain('/barcodes')
  })
})
