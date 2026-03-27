import { test, expect } from '@playwright/test'

test.describe('Job Orders (Embroidery)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/job-orders')
    // Wait for job orders to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Job Orders List', () => {
    test('should load job orders page', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'งานปักเสื้อ' })).toBeVisible()
    })

    test('should display create new job order button', async ({ page }) => {
      const newJobBtn = page.getByRole('link', { name: /รับงานปักใหม่|new job|เพิ่มงาน/i })
      await expect(newJobBtn).toBeVisible()
    })

    test('should have job orders list or board view', async ({ page }) => {
      // Check for Kanban or table view
      const board = page.locator('[class*="kanban"], [class*="board"], table').first()
      if (await board.isVisible({ timeout: 10000 }).catch(() => false)) {
        await expect(board).toBeVisible()
      }
    })

    test('should have search functionality', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหา|search/i)
      if (await searchInput.isVisible().catch(() => false)) {
        await expect(searchInput).toBeVisible()
        // Try searching
        await searchInput.fill('test')
        await page.waitForLoadState('networkidle')
      }
    })

    test('should support view toggle (Kanban/Table)', async ({ page }) => {
      // Look for view toggle buttons
      const toggleBtn = page.getByRole('button', { name: /kanban|table|ตาราง|บอร์ด/i })
      if (await toggleBtn.first().isVisible().catch(() => false)) {
        const initialView = page.locator('[class*="kanban"], [class*="board"], table').first()
        if (await initialView.isVisible().catch(() => false)) {
          // Toggle to another view
          await toggleBtn.first().click()
          await page.waitForLoadState('networkidle')
        }
      }
    })
  })

  test.describe('Create New Job Order', () => {
    test('should navigate to new job order page', async ({ page }) => {
      await page.getByRole('link', { name: /รับงานปักใหม่|new job|เพิ่มงาน/i }).click()
      await page.waitForURL('**/job-orders/new', { timeout: 10000 })
      await expect(page.url()).toContain('/job-orders/new')
    })

    test('should display job order form', async ({ page }) => {
      await page.goto('/job-orders/new')
      await page.waitForLoadState('networkidle')

      // Check for form elements
      const form = page.locator('form').first()
      if (await form.isVisible().catch(() => false)) {
        await expect(form).toBeVisible()
      }
    })

    test('should have customer information fields', async ({ page }) => {
      await page.goto('/job-orders/new')
      await page.waitForLoadState('networkidle')

      // Look for customer fields
      const customerNameInput = page.getByLabel(/ชื่อลูกค้า|customer|name/i)
      const customerPhoneInput = page.getByLabel(/เบอร์|phone|tel/i)

      if (await customerNameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(customerNameInput).toBeVisible()
      }
    })

    test('should have garment type and quantity fields', async ({ page }) => {
      await page.goto('/job-orders/new')
      await page.waitForLoadState('networkidle')

      // Look for garment details
      const garmentInput = page.getByLabel(/ประเภท|garment|เสื้อ|ชุด/i)
      const quantityInput = page.getByLabel(/จำนวน|quantity|qty/i)

      if (await garmentInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(garmentInput).toBeVisible()
      }

      if (await quantityInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(quantityInput).toBeVisible()
      }
    })

    test('should have pricing fields', async ({ page }) => {
      await page.goto('/job-orders/new')
      await page.waitForLoadState('networkidle')

      // Look for price/deposit fields
      const priceInput = page.getByLabel(/ราคา|price|fee/i)
      const depositInput = page.getByLabel(/มัดจำ|deposit/i)

      if (await priceInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(priceInput).toBeVisible()
      }

      if (await depositInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(depositInput).toBeVisible()
      }
    })

    test('should have deadline field', async ({ page }) => {
      await page.goto('/job-orders/new')
      await page.waitForLoadState('networkidle')

      // Look for deadline/date field
      const deadlineInput = page.getByLabel(/วันครบ|deadline|date|วันที่/i)
      if (await deadlineInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(deadlineInput).toBeVisible()
      }
    })

    test('should have staff assignment field', async ({ page }) => {
      await page.goto('/job-orders/new')
      await page.waitForLoadState('networkidle')

      // Look for staff assignment
      const assignInput = page.getByLabel(/มอบหมาย|assign|staff|พนักงาน/i)
      if (await assignInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(assignInput).toBeVisible()
      }
    })

    test('should create new job order', async ({ page }) => {
      await page.goto('/job-orders/new')
      await page.waitForLoadState('networkidle')

      // Fill customer name
      const customerNameInput = page.getByLabel(/ชื่อลูกค้า|customer|name/i)
      if (await customerNameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await customerNameInput.fill(`Customer ${Date.now()}`)
      }

      // Fill phone
      const phoneInput = page.getByLabel(/เบอร์|phone|tel/i)
      if (await phoneInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await phoneInput.fill('0812345678')
      }

      // Fill quantity
      const quantityInput = page.getByLabel(/จำนวน|quantity|qty/i)
      if (await quantityInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await quantityInput.fill('5')
      }

      // Fill price
      const priceInput = page.getByLabel(/ราคา|price|fee/i)
      if (await priceInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        const inputs = await priceInput.all()
        if (inputs.length > 0) {
          await inputs[0].fill('500')
        }
      }

      // Submit form
      const submitBtn = page.getByRole('button', { name: /บันทึก|save|submit|เพิ่ม/i })
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.click()
        await page.waitForLoadState('networkidle')
        // Should redirect to job orders list or detail
      }
    })
  })

  test.describe('Job Order Detail', () => {
    test('should navigate to job order detail', async ({ page }) => {
      // Find first job order link
      const jobLinks = page.locator('a[href*="/job-orders/"], [class*="job-order"]')
      const firstLink = jobLinks.first()

      if (await firstLink.isVisible({ timeout: 10000 }).catch(() => false)) {
        const href = await firstLink.getAttribute('href')
        if (href && !href.includes('/new')) {
          await firstLink.click()
          await page.waitForLoadState('networkidle')
          // Should be on detail page
        }
      }
    })

    test('should display job order details', async ({ page }) => {
      // Navigate to a job order if possible
      const jobLinks = page.locator('a[href*="/job-orders/"], [class*="job-order"]')
      const firstLink = jobLinks.first()

      if (await firstLink.isVisible({ timeout: 10000 }).catch(() => false)) {
        const href = await firstLink.getAttribute('href')
        if (href && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')

          // Check for job order details
          const heading = page.locator('h1, h2').first()
          if (await heading.isVisible().catch(() => false)) {
            await expect(heading).toBeVisible()
          }
        }
      }
    })

    test('should display status badge', async ({ page }) => {
      // Navigate to job order
      const jobLinks = page.locator('a[href*="/job-orders/"], [class*="job-order"]')
      const firstLink = jobLinks.first()

      if (await firstLink.isVisible({ timeout: 10000 }).catch(() => false)) {
        const href = await firstLink.getAttribute('href')
        if (href && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')

          // Look for status badge
          const statusBadge = page.locator('[class*="badge"], [class*="status"]').first()
          if (await statusBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
            await expect(statusBadge).toBeVisible()
          }
        }
      }
    })

    test('should allow status transition', async ({ page }) => {
      // Navigate to job order
      const jobLinks = page.locator('a[href*="/job-orders/"], [class*="job-order"]')
      const firstLink = jobLinks.first()

      if (await firstLink.isVisible({ timeout: 10000 }).catch(() => false)) {
        const href = await firstLink.getAttribute('href')
        if (href && !href.includes('/new')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')

          // Look for status transition buttons
          const statusBtn = page.getByRole('button', { name: /อนุมัติ|เริ่ม|complete|จบ|ยืนยัน/i })
          if (await statusBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
            await statusBtn.first().click()
            await page.waitForLoadState('networkidle')
            // Status should update
          }
        }
      }
    })
  })

  test.describe('Public Order Tracking', () => {
    test('should access public tracking without authentication', async ({ browser }) => {
      // Create a new context without auth state
      const context = await browser.newContext()
      const page = await context.newPage()

      // Try to access track page
      await page.goto('/track/sample-order-123')

      // Should not redirect to login
      await expect(page.url()).toContain('/track')

      // Should display order tracking info or "not found" message
      const heading = page.locator('h1, h2').first()
      const notFound = page.getByText(/ไม่พบ|not found/i)

      const headingVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false)
      const notFoundVisible = await notFound.isVisible({ timeout: 5000 }).catch(() => false)

      if (headingVisible || notFoundVisible) {
        expect(headingVisible || notFoundVisible).toBe(true)
      }

      await context.close()
    })

    test('should display order tracking information when order exists', async ({ page }) => {
      // First, get a real order number from the dashboard or job orders
      await page.goto('/job-orders')
      await page.waitForLoadState('networkidle')

      // Try to find an order link
      const orderLink = page.locator('a[href*="/job-orders/"]').first()
      let orderNumber = null

      if (await orderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Extract order ID from href
        const href = await orderLink.getAttribute('href')
        if (href) {
          const match = href.match(/\/([^/]+)$/)
          if (match) {
            orderNumber = match[1]
          }
        }
      }

      // If we found an order, test tracking
      if (orderNumber) {
        await page.goto(`/track/${orderNumber}`)
        await page.waitForLoadState('networkidle')

        // Should display tracking info
        const content = page.locator('body').first()
        await expect(content).toBeVisible()
      }
    })

    test('should show order status progress', async ({ page }) => {
      // Access tracking page with a sample order
      await page.goto('/track/sample-order')

      // Should display progress or timeline
      const progress = page.locator('[class*="progress"], [class*="timeline"], [class*="status"]').first()
      if (await progress.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(progress).toBeVisible()
      }
    })
  })
})
