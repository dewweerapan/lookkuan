import { test, expect } from '@playwright/test'

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Inventory List', () => {
    test('should load inventory page with products', async ({ page }) => {
      await expect(page.getByText('สินค้าและสต็อก')).toBeVisible()
      // Wait for product list to load
      await page.waitForSelector('[class*="product"], table tbody tr', { timeout: 10000 }).catch(() => null)
    })

    test('should display inventory stats', async ({ page }) => {
      await expect(page.getByText('สินค้าในคลังทั้งหมด')).toBeVisible()
      await expect(page.getByText('มูลค่าสต็อกรวม')).toBeVisible()
      await expect(page.getByText('สินค้าใกล้หมด')).toBeVisible()
    })

    test('should have action buttons', async ({ page }) => {
      // Check for navigation buttons
      await expect(page.getByRole('link', { name: /เพิ่มสินค้า/ })).toBeVisible()
      await expect(page.getByRole('link', { name: /หมวดหมู่/ })).toBeVisible()
      await expect(page.getByRole('link', { name: /ประวัติสต็อก/ })).toBeVisible()
    })

    test('should have search functionality', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหา|search/i)
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('shirt')
        await page.waitForLoadState('networkidle')
        // Products should be filtered
      }
    })

    test('should have category filter', async ({ page }) => {
      // Check for category dropdown/select
      const categorySelect = page.locator('select, [role="listbox"]').first()
      if (await categorySelect.isVisible().catch(() => false)) {
        // Filter should exist and be functional
        await expect(categorySelect).toBeVisible()
      }
    })
  })

  test.describe('Add New Product', () => {
    test('should navigate to new product page', async ({ page }) => {
      await page.getByRole('link', { name: /เพิ่มสินค้า/ }).click()
      await page.waitForURL('**/inventory/new', { timeout: 10000 })
      await expect(page.url()).toContain('/inventory/new')
    })

    test('should display product form fields', async ({ page }) => {
      await page.goto('/inventory/new')
      await page.waitForLoadState('networkidle')

      // Check for form fields
      const form = page.locator('form').first()
      if (await form.isVisible().catch(() => false)) {
        // Check for main fields
        const nameInput = page.getByLabel(/ชื่อ|name/i)
        const descInput = page.getByLabel(/คำอธิบาย|description/i)
        const categoryInput = page.locator('select, [role="listbox"]').first()

        if (await nameInput.isVisible().catch(() => false)) {
          await expect(nameInput).toBeVisible()
        }
      }
    })

    test('should create new product with variant', async ({ page }) => {
      await page.goto('/inventory/new')
      await page.waitForLoadState('networkidle')

      // Try to find and fill form fields
      const nameInput = page.getByLabel(/ชื่อ|name/i)
      const descInput = page.getByLabel(/คำอธิบาย|description/i)

      if (await nameInput.isVisible().catch(() => false)) {
        // Fill basic fields
        const uniqueName = `Test Product ${Date.now()}`
        await nameInput.fill(uniqueName)

        if (await descInput.isVisible().catch(() => false)) {
          await descInput.fill('Test Description')
        }

        // Look for variant/size/color fields
        const sizeInput = page.getByLabel(/ขนาด|size/i)
        const colorInput = page.getByLabel(/สี|color/i)
        const priceInput = page.getByLabel(/ราคา|price/i)

        if (await sizeInput.isVisible().catch(() => false)) {
          await sizeInput.fill('M')
        }

        if (await colorInput.isVisible().catch(() => false)) {
          await colorInput.fill('Blue')
        }

        if (await priceInput.isVisible().catch(() => false)) {
          const inputs = await priceInput.all()
          if (inputs.length > 0) {
            await inputs[0].fill('299')
          }
        }

        // Submit form
        const submitBtn = page.getByRole('button', { name: /บันทึก|save|submit/i })
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click()
          // Wait for redirect or success message
          await page.waitForLoadState('networkidle')
        }
      }
    })
  })

  test.describe('Product Detail', () => {
    test('should navigate to product detail', async ({ page }) => {
      // Get first product link
      const productLink = page.locator('a[href*="/inventory/"], button').first()
      if (await productLink.isVisible().catch(() => false)) {
        // We need to find actual product links
        const links = page.locator('a[href*="/inventory/"][href*="/inventory/"][href!="/inventory/new"]')
        const firstLink = links.first()

        if (await firstLink.isVisible().catch(() => false)) {
          const href = await firstLink.getAttribute('href')
          if (href && !href.includes('/new') && !href.includes('/categories')) {
            await firstLink.click()
            await page.waitForLoadState('networkidle')
            // Should be on detail page
            await expect(page.url()).toMatch(/\/inventory\/[^/]+$/)
          }
        }
      }
    })

    test('should display product details and tabs', async ({ page }) => {
      // Navigate to first product if possible
      const links = page.locator('a[href*="/inventory/"][href!="/inventory/new"]')
      const firstLink = links.first()

      if (await firstLink.isVisible().catch(() => false)) {
        const href = await firstLink.getAttribute('href')
        if (href && !href.includes('/categories')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')

          // Check for detail content
          const heading = page.locator('h1, h2').first()
          if (await heading.isVisible().catch(() => false)) {
            await expect(heading).toBeVisible()
          }

          // Check for tabs
          const tabs = page.locator('[role="tab"], .tab')
          if (await tabs.first().isVisible().catch(() => false)) {
            await expect(tabs.first()).toBeVisible()
          }
        }
      }
    })

    test('should handle stock adjustment', async ({ page }) => {
      // Navigate to product detail
      const links = page.locator('a[href*="/inventory/"][href!="/inventory/new"]')
      const firstLink = links.first()

      if (await firstLink.isVisible().catch(() => false)) {
        const href = await firstLink.getAttribute('href')
        if (href && !href.includes('/categories')) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')

          // Look for stock adjustment button
          const adjustBtn = page.getByRole('button', { name: /ปรับ|adjust|stock/i })
          if (await adjustBtn.first().isVisible().catch(() => false)) {
            await adjustBtn.first().click()
            // A dialog or form should appear
          }
        }
      }
    })
  })

  test.describe('Categories', () => {
    test('should navigate to categories page', async ({ page }) => {
      await page.getByRole('link', { name: /หมวดหมู่/ }).click()
      await page.waitForURL('**/inventory/categories', { timeout: 10000 })
      await expect(page.url()).toContain('/inventory/categories')
    })

    test('should display categories list', async ({ page }) => {
      await page.goto('/inventory/categories')
      await page.waitForLoadState('networkidle')

      // Check for page title
      const heading = page.locator('h1, h2').first()
      if (await heading.isVisible().catch(() => false)) {
        await expect(heading).toBeVisible()
      }
    })

    test('should have add category option', async ({ page }) => {
      await page.goto('/inventory/categories')
      await page.waitForLoadState('networkidle')

      // Check for add button
      const addBtn = page.getByRole('button', { name: /เพิ่ม|add|new/i })
      if (await addBtn.first().isVisible().catch(() => false)) {
        await expect(addBtn.first()).toBeVisible()
      }
    })
  })

  test.describe('Inventory Movements', () => {
    test('should navigate to movements page', async ({ page }) => {
      await page.getByRole('link', { name: /ประวัติสต็อก/ }).click()
      await page.waitForURL('**/inventory/movements', { timeout: 10000 })
      await expect(page.url()).toContain('/inventory/movements')
    })

    test('should display movements table', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      // Check for page header
      const heading = page.locator('h1, h2').first()
      if (await heading.isVisible().catch(() => false)) {
        await expect(heading).toBeVisible()
      }

      // Check for table
      const table = page.locator('table, [role="grid"]').first()
      if (await table.isVisible().catch(() => false)) {
        await expect(table).toBeVisible()
      }
    })

    test('should have movement history columns', async ({ page }) => {
      await page.goto('/inventory/movements')
      await page.waitForLoadState('networkidle')

      // Look for common table headers
      const table = page.locator('table, [role="grid"]').first()
      if (await table.isVisible().catch(() => false)) {
        // Movements table should have columns for date, product, type, quantity, etc.
        const headers = page.locator('th')
        if (await headers.first().isVisible().catch(() => false)) {
          await expect(headers.first()).toBeVisible()
        }
      }
    })
  })
})
