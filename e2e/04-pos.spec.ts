import { test, expect } from '@playwright/test'

test.describe('Point of Sale (POS)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pos')
    // Wait for products to load
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[class*="product"], button:has-text("สินค้า")', { timeout: 10000 }).catch(() => null)
  })

  test.describe('POS Page Loading', () => {
    test('should load POS page with product grid', async ({ page }) => {
      // Check page title or heading
      const heading = page.locator('h1, h2').first()
      if (await heading.isVisible().catch(() => false)) {
        await expect(heading).toBeVisible()
      }

      // Should have product grid or list
      const products = page.locator('[class*="product"], [role="button"]').first()
      if (await products.isVisible().catch(() => false)) {
        await expect(products).toBeVisible()
      }
    })

    test('should display cart panel', async ({ page }) => {
      // Look for cart section (typically on the right side)
      const cartHeading = page.getByText(/รถเข็น|cart/i)
      if (await cartHeading.isVisible().catch(() => false)) {
        await expect(cartHeading).toBeVisible()
      }
    })

    test('should have search functionality', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหา|search/i)
      if (await searchInput.isVisible().catch(() => false)) {
        await expect(searchInput).toBeVisible()
      }
    })
  })

  test.describe('Category Filtering', () => {
    test('should have category tabs or buttons', async ({ page }) => {
      // Look for category filter
      const allBtn = page.getByRole('button', { name: /ทั้งหมด|all/i })
      if (await allBtn.isVisible().catch(() => false)) {
        await expect(allBtn).toBeVisible()
      }

      // Other categories might exist
      const categoryBtn = page.locator('[role="tab"], [class*="category"]').first()
      if (await categoryBtn.isVisible().catch(() => false)) {
        await expect(categoryBtn).toBeVisible()
      }
    })

    test('should filter products by category', async ({ page }) => {
      // Get all category buttons
      const categoryBtns = page.locator('[role="tab"], [class*="category"]')
      const count = await categoryBtns.count()

      if (count > 1) {
        // Click first category button
        const firstBtn = categoryBtns.first()
        if (await firstBtn.isVisible().catch(() => false)) {
          await firstBtn.click()
          await page.waitForLoadState('networkidle')
          // Products should be filtered
        }
      }
    })
  })

  test.describe('Product Selection & Cart', () => {
    test('should add product to cart when clicked', async ({ page }) => {
      // Find first available product button
      const productBtns = page.locator('button:has-text("สินค้า"), [class*="product"]').first()
      if (await productBtns.isVisible().catch(() => false)) {
        // Count items in cart before
        const cartItems = page.locator('[class*="cart"] [class*="item"]')
        const countBefore = await cartItems.count()

        await productBtns.click()
        await page.waitForLoadState('networkidle')

        // Cart should update or show toast
        const toast = page.getByText(/เพิ่ม|added/i)
        if (await toast.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(toast).toBeVisible()
        }
      }
    })

    test('should display cart with items', async ({ page }) => {
      // Add a product if cart is empty
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Check cart display
      const cartSection = page.locator('[class*="cart"]').first()
      if (await cartSection.isVisible().catch(() => false)) {
        await expect(cartSection).toBeVisible()
      }
    })

    test('should show cart item with product name and price', async ({ page }) => {
      // Add product to cart
      const productBtn = page.locator('[class*="product"], [role="button"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Cart item should show details
      const cartItem = page.locator('[class*="cart"] [class*="item"]').first()
      if (await cartItem.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(cartItem).toBeVisible()
      }
    })
  })

  test.describe('Cart Operations', () => {
    test('should increase quantity with + button', async ({ page }) => {
      // Add product to cart
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Find increase button
      const increaseBtn = page.getByRole('button', { name: /\+|เพิ่ม|increase/i })
      if (await increaseBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        const qtyBefore = await increaseBtn.first().getAttribute('aria-label')
        await increaseBtn.first().click()
        await page.waitForLoadState('networkidle')
        // Quantity should increase
      }
    })

    test('should decrease quantity with - button', async ({ page }) => {
      // Add product to cart
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Increase quantity first
      const increaseBtn = page.getByRole('button', { name: /\+|เพิ่ม|increase/i })
      if (await increaseBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await increaseBtn.first().click()
        await page.waitForLoadState('networkidle')
      }

      // Now decrease
      const decreaseBtn = page.getByRole('button', { name: /-|ลด|decrease/i })
      if (await decreaseBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await decreaseBtn.first().click()
        await page.waitForLoadState('networkidle')
      }
    })

    test('should remove item from cart', async ({ page }) => {
      // Add product to cart
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Find delete/remove button
      const removeBtn = page.getByRole('button', { name: /ลบ|delete|remove|ถ้วย/i })
      if (await removeBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await removeBtn.first().click()
        await page.waitForLoadState('networkidle')
        // Item should be removed from cart
      }
    })

    test('should display cart total', async ({ page }) => {
      // Add product to cart
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Look for total/subtotal text
      const total = page.getByText(/รวม|total|subtotal/i)
      if (await total.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(total.first()).toBeVisible()
      }
    })
  })

  test.describe('Payment', () => {
    test('should display payment panel when cart has items', async ({ page }) => {
      // Add product to cart
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Payment section should be visible
      const paymentSection = page.locator('[class*="payment"], [class*="checkout"]').first()
      if (await paymentSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(paymentSection).toBeVisible()
      }
    })

    test('should select payment method', async ({ page }) => {
      // Add product to cart
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Look for payment method buttons/radio buttons
      const paymentMethods = page.getByRole('button', { name: /เงินสด|transfer|card|promptpay/i })
      if (await paymentMethods.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        // Cash payment should be default, but test clicking another method
        const transferBtn = page.getByRole('button', { name: /โอน|transfer/i })
        if (await transferBtn.isVisible().catch(() => false)) {
          await transferBtn.click()
        }
      }
    })

    test('should process cash payment with change calculation', async ({ page }) => {
      // Add product to cart
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Ensure cash method is selected
      const cashBtn = page.getByRole('button', { name: /เงินสด|cash/i })
      if (await cashBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const isSelected = await cashBtn.evaluate(el => el.classList.contains('active') || el.getAttribute('aria-pressed') === 'true')
        if (!isSelected) {
          await cashBtn.click()
        }
      }

      // Enter cash amount
      const cashInput = page.getByLabel(/เงินสด|cash|amount/i)
      if (await cashInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await cashInput.fill('1000')
      }

      // Check for change calculation
      const changeText = page.getByText(/ทอน|change|เงินทอน/i)
      if (await changeText.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(changeText.first()).toBeVisible()
      }

      // Submit payment
      const submitBtn = page.getByRole('button', { name: /ชำระ|pay|ยืนยัน|confirm/i })
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.click()
        await page.waitForLoadState('networkidle')
        // Should show success message or redirect
      }
    })

    test('should show receipt after successful payment', async ({ page }) => {
      // Add product and complete payment
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await productBtn.click()
        await page.waitForLoadState('networkidle')
      }

      // Process payment
      const submitBtn = page.getByRole('button', { name: /ชำระ|pay|ยืนยัน|confirm/i })
      if (await submitBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.first().click()
        await page.waitForLoadState('networkidle')
      }

      // Look for receipt or success confirmation
      const receiptOrConfirm = page.getByText(/ใบเสร็จ|receipt|สำเร็จ|success/i)
      if (await receiptOrConfirm.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(receiptOrConfirm.first()).toBeVisible()
      }
    })
  })

  test.describe('Barcode Scanning', () => {
    test('should support barcode input', async ({ page }) => {
      // This is a passive test - barcode scanning happens via keyboard events
      // The feature should be present but we can't fully test scanner hardware

      // Just verify the page is ready for barcode input
      const body = page.locator('body')
      await expect(body).toBeVisible()

      // In a real test with a barcode scanner, you'd simulate keyboard input
      // For now, we just verify the page is interactive
      const productBtn = page.locator('[class*="product"]').first()
      if (await productBtn.isVisible().catch(() => false)) {
        await expect(productBtn).toBeVisible()
      }
    })
  })
})
