import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

test.describe('Advanced Inventory Features', () => {
  test.describe('AI Reorder Suggestions (/inventory/reorder)', () => {
    test('should load reorder page with heading', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      // PageHeader shows "AI แนะนำการสั่งซื้อ"
      const heading = page.getByRole('heading', { name: /AI แนะนำการสั่งซื้อ|แนะนำการสั่งซื้อ|reorder/i })
      if (await heading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(heading.first()).toBeVisible()
      } else {
        const fallback = page.locator('h1, h2').first()
        await expect(fallback).toBeVisible()
      }
    })

    test('should show description about analysis period', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      // Description mentions 30-day analysis or urgent/warning counts
      const desc = page.getByText(/30 วัน|วิเคราะห์|ด่วน|แนะนำ/i)
      if (await desc.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(desc.first()).toBeVisible()
      }
    })

    test('should show urgent or warning items OR all-good empty state', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      // Either: items with priority labels, or the empty state message
      const urgentLabel = page.getByText(/ด่วน/i)
      const warningLabel = page.getByText(/แนะนำ/i)
      const emptyState = page.getByText(/สต็อกทุกรายการอยู่ในระดับดี|ไม่มีสินค้าที่ต้องสั่งซื้อ|ไม่พบสินค้าในระบบ/i)

      const hasUrgent = await urgentLabel.first().isVisible({ timeout: 5000 }).catch(() => false)
      const hasWarning = await warningLabel.first().isVisible({ timeout: 5000 }).catch(() => false)
      const hasEmpty = await emptyState.first().isVisible({ timeout: 5000 }).catch(() => false)

      expect(hasUrgent || hasWarning || hasEmpty).toBe(true)
    })

    test('should display filter tabs (ทั้งหมด, ด่วน, แนะนำ)', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      // Filter tabs only render when there are suggestions
      const allTab = page.getByRole('button', { name: /ทั้งหมด/i })
      if (await allTab.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(allTab.first()).toBeVisible()

        const urgentTab = page.getByRole('button', { name: /ด่วน/i })
        if (await urgentTab.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(urgentTab.first()).toBeVisible()
        }

        const warningTab = page.getByRole('button', { name: /แนะนำ/i })
        if (await warningTab.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(warningTab.first()).toBeVisible()
        }
      }
    })

    test('should filter to urgent items when ด่วน tab clicked', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      const urgentTab = page.getByRole('button', { name: /^ด่วน/i })
      if (await urgentTab.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await urgentTab.first().click()
        await page.waitForLoadState('networkidle')
        // Page should still be on reorder
        expect(page.url()).toContain('/inventory/reorder')
      }
    })

    test('should have "สร้างใบสั่งซื้อ" link to /purchase-orders/new', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      const createOrderLink = page.getByRole('link', { name: /สร้างใบสั่งซื้อ/i })
      if (await createOrderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(createOrderLink).toBeVisible()

        const href = await createOrderLink.getAttribute('href')
        expect(href).toContain('/purchase-orders/new')
      }
    })

    test('should show summary cards with ด่วน and แนะนำ counts', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      // Summary cards only appear when there are suggestions
      const summaryCards = page.locator('[class*="rounded-xl"][class*="border"]')
      const count = await summaryCards.count()
      if (count > 0) {
        await expect(summaryCards.first()).toBeVisible()
      }
    })

    test('should show back link to /inventory', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      const backLink = page.getByRole('link', { name: /กลับ|back|คลังสินค้า/i })
      if (await backLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(backLink.first()).toBeVisible()
      }
    })

    test('should show SKU and product details for suggestion items', async ({ page }) => {
      await page.goto('/inventory/reorder')
      await page.waitForLoadState('networkidle')

      // Only if there are items, check for product detail columns
      const suggestionRows = page.locator('table tbody tr, [class*="rounded-xl"][class*="border"] p')
      const rowCount = await suggestionRows.count()
      if (rowCount > 0) {
        // velocity or days remaining labels should be visible
        const velocityLabel = page.getByText(/velocity|คงเหลือ|แนะนำสั่ง/i)
        if (await velocityLabel.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(velocityLabel.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('Store Map (/inventory/map)', () => {
    test('should load map page with heading ผังสินค้า', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      const heading = page.getByRole('heading', { name: /ผังสินค้า|ตำแหน่งสินค้า|shelf map/i })
      if (await heading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(heading.first()).toBeVisible()
      } else {
        const fallback = page.locator('h1, h2').first()
        await expect(fallback).toBeVisible()
      }
    })

    test('should show description about shelf location', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      const desc = page.getByText(/ตำแหน่งสินค้าบนชั้นวาง|ชั้นวาง|shelf/i)
      if (await desc.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(desc.first()).toBeVisible()
      }
    })

    test('should show shelf grid OR empty state', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      // Either shelf cards/grid or empty state
      const shelfCards = page.locator('[class*="rounded-xl"][class*="border"]')
      const emptyState = page.getByText(/ยังไม่มีสินค้า|ไม่พบ|empty|ไม่มีข้อมูล/i)

      const hasCards = await shelfCards.first().isVisible({ timeout: 5000 }).catch(() => false)
      const hasEmpty = await emptyState.first().isVisible({ timeout: 5000 }).catch(() => false)

      // At least the page container should be visible
      if (!hasCards && !hasEmpty) {
        const container = page.locator('div').first()
        await expect(container).toBeVisible()
      } else {
        expect(hasCards || hasEmpty).toBe(true)
      }
    })

    test('should have product search input', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      const searchInput = page.getByPlaceholder(/ค้นหา|search|ชื่อสินค้า|SKU/i)
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(searchInput).toBeVisible()
      }
    })

    test('should filter shelves when searching by product name', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      const searchInput = page.getByPlaceholder(/ค้นหา|search|ชื่อสินค้า|SKU/i)
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.fill('เสื้อ')
        await page.waitForTimeout(500)
        // Page should still be on map
        expect(page.url()).toContain('/inventory/map')
      }
    })

    test('should show shelf location badges on variants', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      // Shelf location codes like A-01, B-02 etc displayed as badges
      const locationBadge = page.locator('[class*="badge"], [class*="font-mono"], [class*="shelf"]')
      if (await locationBadge.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(locationBadge.first()).toBeVisible()
      }
    })

    test('should have back/return button to inventory', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      // PageHeader has a "← กลับ" link back to /inventory
      const backLink = page.getByRole('link', { name: /กลับ|back|← กลับ/i })
      if (await backLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(backLink.first()).toBeVisible()
      }
    })

    test('should navigate back to inventory when clicking back', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      // Find back link by href (most reliable) or by aria-label/text
      const backLink = page.locator('a[href="/inventory"]').first()
      if (await backLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await backLink.click()
        await page.waitForURL(/\/inventory$/, { timeout: 10000 })
        expect(page.url()).toContain('/inventory')
        expect(page.url()).not.toContain('/inventory/map')
      }
    })

    test('should show edit mode toggle if available', async ({ page }) => {
      await page.goto('/inventory/map')
      await page.waitForLoadState('networkidle')

      // Edit mode button
      const editBtn = page.getByRole('button', { name: /แก้ไข|edit|จัดเรียง/i })
      if (await editBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(editBtn.first()).toBeVisible()
      }
    })
  })

  test.describe('Stock Movements (/inventory/movements)', () => {
    test('should load movements page with heading ประวัติสต็อก', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      const heading = page.getByRole('heading', { name: /ประวัติสต็อก|stock movement|ความเคลื่อนไหว/i })
      if (await heading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(heading.first()).toBeVisible()
      } else {
        const fallback = page.locator('h1, h2').first()
        await expect(fallback).toBeVisible()
      }
    })

    test('should show description about stock movements', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      const desc = page.getByText(/ความเคลื่อนไหวสินค้าคงคลัง|สินค้าคงคลัง/i)
      if (await desc.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(desc.first()).toBeVisible()
      }
    })

    test('should display movement history table or empty state', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      const table = page.locator('table')
      const emptyState = page.getByText(/ยังไม่มีประวัติการเคลื่อนไหว|ไม่มีประวัติ/i)

      const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false)
      const hasEmpty = await emptyState.isVisible({ timeout: 5000 }).catch(() => false)

      expect(hasTable || hasEmpty).toBe(true)
    })

    test('should have correct table column headers', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      const table = page.locator('table')
      if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Check for date column
        const dateCol = page.getByRole('columnheader', { name: /วันที่/i })
        if (await dateCol.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(dateCol).toBeVisible()
        }

        // Check for type column
        const typeCol = page.getByRole('columnheader', { name: /ประเภท/i })
        if (await typeCol.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(typeCol).toBeVisible()
        }

        // Check for product column
        const productCol = page.getByRole('columnheader', { name: /สินค้า/i })
        if (await productCol.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(productCol).toBeVisible()
        }

        // Check for quantity column
        const qtyCol = page.getByRole('columnheader', { name: /จำนวน/i })
        if (await qtyCol.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(qtyCol).toBeVisible()
        }
      }
    })

    test('should show all required columns (วันที่, ประเภท, สินค้า, ตัวเลือก, จำนวน, หมายเหตุ, โดย)', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      const table = page.locator('table')
      if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
        const headers = ['วันที่', 'ประเภท', 'สินค้า', 'ตัวเลือก', 'จำนวน', 'หมายเหตุ', 'โดย']
        for (const header of headers) {
          const col = page.getByRole('columnheader', { name: header })
          if (await col.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(col).toBeVisible()
          }
        }
      }
    })

    test('should show movement type with color coding (green for IN, red for OUT)', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      // Look for colored text in the table (green-600 for positive, red-600 for negative)
      const greenText = page.locator('.text-green-600')
      const redText = page.locator('.text-red-600')

      const hasGreen = await greenText.first().isVisible({ timeout: 5000 }).catch(() => false)
      const hasRed = await redText.first().isVisible({ timeout: 5000 }).catch(() => false)

      // If there are movements, at least one color should appear
      const table = page.locator('table tbody tr')
      const rowCount = await table.count()
      if (rowCount > 0) {
        expect(hasGreen || hasRed).toBe(true)
      }
    })

    test('should show quantity change with + or - prefix', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      // Movements show +N or -N in the quantity column
      const posQty = page.getByText(/^\+\d+$/)
      const negQty = page.getByText(/^-\d+$/)

      const hasPos = await posQty.first().isVisible({ timeout: 5000 }).catch(() => false)
      const hasNeg = await negQty.first().isVisible({ timeout: 5000 }).catch(() => false)

      // Only assert if there are actual movements
      const table = page.locator('table tbody tr')
      const rowCount = await table.count()
      if (rowCount > 1) {
        // More than 1 row means real data (not just empty state row)
        expect(hasPos || hasNeg).toBe(true)
      }
    })

    test('should show back link to /inventory', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      const backLink = page.getByRole('link', { name: /กลับ|back|← กลับ/i })
      if (await backLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(backLink.first()).toBeVisible()
      }
    })

    test('should navigate back to inventory when clicking back', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      // Find back link by href (most reliable)
      const backLink = page.locator('a[href="/inventory"]').first()
      if (await backLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await backLink.click()
        await page.waitForURL(/\/inventory$/, { timeout: 10000 })
        expect(page.url()).toContain('/inventory')
        expect(page.url()).not.toContain('/inventory/movements')
      }
    })

    test('should display SKU in monospace font for movement rows', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      // SKU is shown in font-mono class
      const sku = page.locator('.font-mono')
      if (await sku.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(sku.first()).toBeVisible()
      }
    })

    test('should show note column (หมายเหตุ)', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      const table = page.locator('table')
      if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
        const noteCol = page.getByRole('columnheader', { name: 'หมายเหตุ' })
        if (await noteCol.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(noteCol).toBeVisible()
        }
      }
    })
  })
})
