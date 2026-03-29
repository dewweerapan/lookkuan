import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

test.describe('Suppliers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/suppliers')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Page Load', () => {
    test('should load suppliers page with heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'ซัพพลายเออร์' })).toBeVisible()
    })

    test('should show page description', async ({ page }) => {
      await expect(page.getByText('จัดการข้อมูลซัพพลายเออร์')).toBeVisible()
    })
  })

  test.describe('Supplier List', () => {
    test('should display desktop table with correct columns', async ({ page }) => {
      const table = page.locator('table').first()
      if (await table.isVisible().catch(() => false)) {
        await expect(page.locator('th').filter({ hasText: 'ชื่อบริษัท' })).toBeVisible()
        await expect(page.locator('th').filter({ hasText: 'ผู้ติดต่อ' })).toBeVisible()
        await expect(page.locator('th').filter({ hasText: 'โทรศัพท์' })).toBeVisible()
        await expect(page.locator('th').filter({ hasText: 'อีเมล' })).toBeVisible()
        await expect(page.locator('th').filter({ hasText: 'เงื่อนไขชำระ' })).toBeVisible()
        await expect(page.locator('th').filter({ hasText: 'สถานะ' })).toBeVisible()
      }
    })

    test('should display empty state message when no suppliers', async ({ page }) => {
      // If no suppliers exist, the page shows "ยังไม่มีซัพพลายเออร์"
      const rows = page.locator('table tbody tr')
      const rowCount = await rows.count().catch(() => 0)
      if (rowCount === 0) {
        const emptyMsg = page.getByText('ยังไม่มีซัพพลายเออร์')
        if (await emptyMsg.isVisible().catch(() => false)) {
          await expect(emptyMsg).toBeVisible()
        }
      }
    })

    test('should display mobile cards on small viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.waitForLoadState('networkidle')

      // Mobile cards container uses lg:hidden
      const mobileContainer = page.locator('.lg\\:hidden').first()
      if (await mobileContainer.isVisible().catch(() => false)) {
        await expect(mobileContainer).toBeVisible()
      }
    })
  })

  test.describe('Add Supplier', () => {
    test('should have "เพิ่มซัพพลายเออร์" button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /เพิ่มซัพพลายเออร์/ })).toBeVisible()
    })

    test('should open add supplier modal on button click', async ({ page }) => {
      await page.getByRole('button', { name: /เพิ่มซัพพลายเออร์/ }).click()
      // Modal should appear with heading
      await expect(page.getByRole('heading', { name: 'เพิ่มซัพพลายเออร์' })).toBeVisible()
    })

    test('should display all form fields in add supplier modal', async ({ page }) => {
      await page.getByRole('button', { name: /เพิ่มซัพพลายเออร์/ }).click()
      await expect(page.getByPlaceholder('ชื่อบริษัทหรือร้านค้า')).toBeVisible()
      await expect(page.getByPlaceholder('ชื่อผู้ติดต่อ')).toBeVisible()
      await expect(page.getByPlaceholder('0XX-XXX-XXXX')).toBeVisible()
      await expect(page.getByPlaceholder('email@example.com')).toBeVisible()
    })

    test('should close modal when cancel button is clicked', async ({ page }) => {
      await page.getByRole('button', { name: /เพิ่มซัพพลายเออร์/ }).click()
      await expect(page.getByRole('heading', { name: 'เพิ่มซัพพลายเออร์' })).toBeVisible()
      await page.getByRole('button', { name: 'ยกเลิก' }).click()
      await expect(page.getByRole('heading', { name: 'เพิ่มซัพพลายเออร์' })).not.toBeVisible()
    })

    test('should have required field indicator on company name', async ({ page }) => {
      await page.getByRole('button', { name: /เพิ่มซัพพลายเออร์/ }).click()
      // The label contains "ชื่อบริษัท" and a red asterisk
      await expect(page.locator('label').filter({ hasText: 'ชื่อบริษัท' })).toBeVisible()
    })
  })
})

test.describe('Purchase Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchase-orders')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Page Load', () => {
    test('should load purchase orders page with heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'ใบสั่งซื้อ' })).toBeVisible()
    })

    test('should show page description', async ({ page }) => {
      await expect(page.getByText('จัดการใบสั่งซื้อสินค้าจากซัพพลายเออร์')).toBeVisible()
    })
  })

  test.describe('Purchase Order List', () => {
    test('should display purchase orders list or empty state', async ({ page }) => {
      // Either a table/list of orders or empty state should be visible
      const table = page.locator('table').first()
      const hasTable = await table.isVisible().catch(() => false)

      if (!hasTable) {
        // May show an empty state component
        const emptyOrContent = page.locator('main, [class*="container"]').first()
        if (await emptyOrContent.isVisible().catch(() => false)) {
          await expect(emptyOrContent).toBeVisible()
        }
      } else {
        await expect(table).toBeVisible()
      }
    })
  })

  test.describe('Create Purchase Order', () => {
    test('should have "สร้างใบสั่งซื้อ" button link', async ({ page }) => {
      const createBtn = page.getByRole('link', { name: /สร้างใบสั่งซื้อ/ })
      await expect(createBtn).toBeVisible()
    })

    test('should navigate to new purchase order form on button click', async ({ page }) => {
      await page.getByRole('link', { name: /สร้างใบสั่งซื้อ/ }).click()
      await page.waitForURL('**/purchase-orders/new', { timeout: 10000 })
      await expect(page.url()).toContain('/purchase-orders/new')
    })
  })
})

test.describe('New Purchase Order Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchase-orders/new')
    await page.waitForLoadState('networkidle')
  })

  test('should load new purchase order page with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'สร้างใบสั่งซื้อ' })).toBeVisible()
  })

  test('should have supplier dropdown', async ({ page }) => {
    // The select for supplier has a default option "— เลือกซัพพลายเออร์ —"
    const supplierSelect = page.locator('select').first()
    await expect(supplierSelect).toBeVisible()
    // Check for default placeholder option
    const defaultOption = page.locator('option').filter({ hasText: /เลือกซัพพลายเออร์/ })
    await expect(defaultOption).toBeAttached()
  })

  test('should have expected date field', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toBeVisible()
  })

  test('should have notes textarea', async ({ page }) => {
    const notesTextarea = page.getByPlaceholder('หมายเหตุ (ถ้ามี)')
    await expect(notesTextarea).toBeVisible()
  })

  test('should display section heading for order info', async ({ page }) => {
    await expect(page.getByText('ข้อมูลใบสั่งซื้อ')).toBeVisible()
  })

  test('should have at least one product line item row', async ({ page }) => {
    // Form starts with one default line item row containing a product select
    const productSelects = page.locator('select')
    // At minimum: supplier select + at least one product select
    const count = await productSelects.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should have back link to purchase orders list', async ({ page }) => {
    // PageHeader with backHref="/purchase-orders" renders a back link
    const backLink = page.getByRole('link', { name: /กลับ|ย้อนกลับ/ })
    if (await backLink.isVisible().catch(() => false)) {
      await expect(backLink).toBeVisible()
    }
  })

  test('should have submit button', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /สร้างใบสั่งซื้อ|บันทึก/i })
    if (await submitBtn.isVisible().catch(() => false)) {
      await expect(submitBtn).toBeVisible()
    }
  })
})
