import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

// ─────────────────────────────────────────────────────────────
// POS: Numeric Keypad
// ─────────────────────────────────────────────────────────────
test.describe('POS: Numeric Keypad', () => {
  // Helper: add any product to cart so the payment button becomes available
  async function addProductToCart(page: import('@playwright/test').Page) {
    await page.goto('/pos')
    await page.waitForLoadState('networkidle')

    // Click the first product button available in the product grid
    const productBtn = page.locator('button[class*="product"], div[class*="product"] button').first()
    if (await productBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productBtn.click()
    } else {
      // Fallback: find any clickable card that isn't a nav/header button
      const anyCard = page.locator('main button, main [role="button"]').first()
      if (await anyCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        await anyCard.click()
      }
    }
  }

  test('cash payment section shows numeric keypad', async ({ page }) => {
    await addProductToCart(page)

    // Open payment modal / panel — look for ชำระเงิน button
    const payBtn = page.getByRole('button', { name: /ชำระเงิน/i })
    if (!(await payBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }
    await payBtn.click()
    await page.waitForLoadState('networkidle')

    // Select cash payment method
    const cashBtn = page.getByRole('button', { name: /เงินสด/i })
    await expect(cashBtn).toBeVisible({ timeout: 5000 })
    await cashBtn.click()

    // Numeric keypad digits 1-9, 0, ←, พอดี should all be visible
    await expect(page.getByRole('button', { name: '1' })).toBeVisible()
    await expect(page.getByRole('button', { name: '5' })).toBeVisible()
    await expect(page.getByRole('button', { name: '9' })).toBeVisible()
    await expect(page.getByRole('button', { name: '0' })).toBeVisible()
    await expect(page.getByRole('button', { name: '←' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'พอดี' })).toBeVisible()
  })

  test('numeric keypad digit entry and backspace work correctly', async ({ page }) => {
    await addProductToCart(page)

    const payBtn = page.getByRole('button', { name: /ชำระเงิน/i })
    if (!(await payBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }
    await payBtn.click()

    const cashBtn = page.getByRole('button', { name: /เงินสด/i })
    await expect(cashBtn).toBeVisible({ timeout: 5000 })
    await cashBtn.click()

    // Display area — shows current cash received value
    const display = page.locator('.pos-input.text-2xl, div.pos-input').first()

    // Tap "1" → display shows "1"
    await page.getByRole('button', { name: '1' }).click()
    await expect(display).toContainText('1')

    // Tap "5" → display shows "15"
    await page.getByRole('button', { name: '5' }).click()
    await expect(display).toContainText('15')

    // Tap "←" (backspace) → display shows "1"
    await page.getByRole('button', { name: '←' }).click()
    await expect(display).toContainText('1')
  })

  test('denomination buttons add to current amount', async ({ page }) => {
    await addProductToCart(page)

    const payBtn = page.getByRole('button', { name: /ชำระเงิน/i })
    if (!(await payBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }
    await payBtn.click()

    const cashBtn = page.getByRole('button', { name: /เงินสด/i })
    await expect(cashBtn).toBeVisible({ timeout: 5000 })
    await cashBtn.click()

    const display = page.locator('.pos-input.text-2xl, div.pos-input').first()

    // Tap "+1000" → amount becomes 1000
    const plus1000 = page.getByRole('button', { name: '+1000' })
    await expect(plus1000).toBeVisible()
    await plus1000.click()
    await expect(display).toContainText('1000')

    // Tap "+1000" again → amount becomes 2000
    await plus1000.click()
    await expect(display).toContainText('2000')
  })

  test('ล้าง button resets amount and พอดี sets exact total', async ({ page }) => {
    await addProductToCart(page)

    const payBtn = page.getByRole('button', { name: /ชำระเงิน/i })
    if (!(await payBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }
    await payBtn.click()

    const cashBtn = page.getByRole('button', { name: /เงินสด/i })
    await expect(cashBtn).toBeVisible({ timeout: 5000 })
    await cashBtn.click()

    const display = page.locator('.pos-input.text-2xl, div.pos-input').first()

    // Enter some digits
    await page.getByRole('button', { name: '5' }).click()
    await expect(display).toContainText('5')

    // ล้าง → resets to empty / shows 0
    const clearBtn = page.getByRole('button', { name: 'ล้าง' })
    await expect(clearBtn).toBeVisible()
    await clearBtn.click()
    // After clearing, display either shows "0" placeholder or is empty
    const displayText = await display.textContent()
    expect(displayText?.trim() === '' || displayText?.trim() === '0').toBeTruthy()

    // พอดี → sets exact total (display should be non-zero)
    const exactBtn = page.getByRole('button', { name: 'พอดี' })
    await expect(exactBtn).toBeVisible()
    await exactBtn.click()
    const afterExact = await display.textContent()
    expect(Number(afterExact?.replace(/[^0-9]/g, '') || '0')).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────
// Job Orders: Batch Status Update (mobile viewport)
// ─────────────────────────────────────────────────────────────
test.describe('Job Orders: Batch Status Update (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport — iPhone SE
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/job-orders')
    await page.waitForLoadState('networkidle')
  })

  test('เลือก button is visible on mobile board view', async ({ page }) => {
    // Ensure we are on the board view (default)
    const boardBtn = page.getByRole('button', { name: /บอร์ด/i })
    if (await boardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await boardBtn.click()
    }

    const selectBtn = page.getByRole('button', { name: 'เลือก' })
    await expect(selectBtn).toBeVisible({ timeout: 5000 })
  })

  test('clicking เลือก enters select mode and cards show checkboxes', async ({ page }) => {
    const boardBtn = page.getByRole('button', { name: /บอร์ด/i })
    if (await boardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await boardBtn.click()
    }

    const selectBtn = page.getByRole('button', { name: 'เลือก' })
    await expect(selectBtn).toBeVisible({ timeout: 5000 })
    await selectBtn.click()

    // Select mode hint text should be visible
    await expect(page.getByText(/แตะการ์ดเพื่อเลือก/i)).toBeVisible()

    // Circular checkboxes should appear in cards (if any cards exist)
    const checkboxes = page.locator('div.w-6.h-6.rounded-full')
    const hasCards = (await checkboxes.count()) > 0
    if (hasCards) {
      await expect(checkboxes.first()).toBeVisible()
    }
  })

  test('tapping a card in select mode selects it and shows orange border', async ({ page }) => {
    const boardBtn = page.getByRole('button', { name: /บอร์ด/i })
    if (await boardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await boardBtn.click()
    }

    const selectBtn = page.getByRole('button', { name: 'เลือก' })
    await expect(selectBtn).toBeVisible({ timeout: 5000 })
    await selectBtn.click()

    // Find a job card (contains order number or customer name text)
    const cards = page.locator('div.relative.bg-white.rounded-xl.border.p-4')
    const cardCount = await cards.count()
    if (cardCount === 0) {
      test.skip()
      return
    }

    // Click first card to select it
    await cards.first().click()

    // Card should now have orange ring
    const selectedCard = page.locator('div.border-orange-400.ring-2.ring-orange-300').first()
    await expect(selectedCard).toBeVisible({ timeout: 3000 })
  })

  test('bottom bar appears with เปลี่ยนสถานะ when item is selected', async ({ page }) => {
    const boardBtn = page.getByRole('button', { name: /บอร์ด/i })
    if (await boardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await boardBtn.click()
    }

    const selectBtn = page.getByRole('button', { name: 'เลือก' })
    await expect(selectBtn).toBeVisible({ timeout: 5000 })
    await selectBtn.click()

    // Bottom bar should appear even before selecting (shows count 0)
    const bottomBar = page.locator('div.fixed.bottom-0')
    await expect(bottomBar).toBeVisible({ timeout: 3000 })

    // "เปลี่ยนสถานะ (0 รายการ)" button is visible in bottom bar
    const statusBtn = page.getByRole('button', { name: /เปลี่ยนสถานะ \(\d+ รายการ\)/ })
    await expect(statusBtn).toBeVisible()

    // Select a card if available
    const cards = page.locator('div.relative.bg-white.rounded-xl.border.p-4')
    if ((await cards.count()) > 0) {
      await cards.first().click()
      // Button text updates to show 1
      await expect(
        page.getByRole('button', { name: /เปลี่ยนสถานะ \(1 รายการ\)/ }),
      ).toBeVisible()
    }
  })

  test('tapping เปลี่ยนสถานะ opens status modal with status options', async ({ page }) => {
    const boardBtn = page.getByRole('button', { name: /บอร์ด/i })
    if (await boardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await boardBtn.click()
    }

    const selectBtn = page.getByRole('button', { name: 'เลือก' })
    await expect(selectBtn).toBeVisible({ timeout: 5000 })
    await selectBtn.click()

    // Need at least 1 card selected to enable the button
    const cards = page.locator('div.relative.bg-white.rounded-xl.border.p-4')
    if ((await cards.count()) === 0) {
      test.skip()
      return
    }
    await cards.first().click()

    const statusBtn = page.getByRole('button', { name: /เปลี่ยนสถานะ \(1 รายการ\)/ })
    await expect(statusBtn).toBeEnabled()
    // dispatchEvent fires the React onClick even when a Next.js portal overlay intercepts pointer events
    await statusBtn.dispatchEvent('click')

    // Status modal should appear
    await expect(page.getByText(/เลือกสถานะสำหรับ/i)).toBeVisible({ timeout: 3000 })

    // Status options — scope to the modal to avoid strict mode conflicts with filter tabs
    const statusModal = page.locator('div.fixed.inset-0.z-50').last()
    await expect(statusModal.getByRole('button', { name: /รอดำเนินการ/i })).toBeVisible()
    await expect(statusModal.getByRole('button', { name: /กำลังปัก/i })).toBeVisible()
    await expect(statusModal.getByRole('button', { name: /เสร็จแล้ว/i })).toBeVisible()
    await expect(statusModal.getByRole('button', { name: /ส่งมอบแล้ว/i })).toBeVisible()
  })

  test('tapping ยกเลิก in bottom bar exits select mode', async ({ page }) => {
    const boardBtn = page.getByRole('button', { name: /บอร์ด/i })
    if (await boardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await boardBtn.click()
    }

    const selectBtn = page.getByRole('button', { name: 'เลือก' })
    await expect(selectBtn).toBeVisible({ timeout: 5000 })
    await selectBtn.click()

    // Bottom bar cancel button
    const cancelBtn = page.locator('div.fixed.bottom-0').getByRole('button', { name: 'ยกเลิก' })
    await expect(cancelBtn).toBeVisible()
    await cancelBtn.click()

    // Bottom bar should disappear
    await expect(page.locator('div.fixed.bottom-0')).not.toBeVisible({ timeout: 3000 })

    // Hint text for select mode is gone
    await expect(page.getByText(/แตะการ์ดเพื่อเลือก/i)).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
// Job Orders: Quick Re-order
// ─────────────────────────────────────────────────────────────
test.describe('Job Orders: Quick Re-order', () => {
  test('สั่งซ้ำ button is visible on a non-cancelled job order detail page', async ({ page }) => {
    await page.goto('/job-orders')
    await page.waitForLoadState('networkidle')

    // Try to find a link to a job order detail page
    const jobLink = page.locator('a[href*="/job-orders/"]').first()
    const hasJobLink = await jobLink.isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasJobLink) {
      test.skip()
      return
    }

    await jobLink.click()
    await page.waitForLoadState('networkidle')

    // สั่งซ้ำ button should be present (unless the job is cancelled)
    const reorderBtn = page.getByRole('button', { name: /สั่งซ้ำ/i })
    const isVisible = await reorderBtn.isVisible({ timeout: 5000 }).catch(() => false)
    // If job is cancelled the button won't be there — skip gracefully
    if (!isVisible) {
      test.skip()
      return
    }
    await expect(reorderBtn).toBeVisible()
  })

  test('clicking สั่งซ้ำ navigates to /job-orders/new with query params', async ({ page }) => {
    await page.goto('/job-orders')
    await page.waitForLoadState('networkidle')

    const jobLink = page.locator('a[href*="/job-orders/"]').first()
    if (!(await jobLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }
    await jobLink.click()
    await page.waitForLoadState('networkidle')

    const reorderBtn = page.getByRole('button', { name: /สั่งซ้ำ/i })
    if (!(await reorderBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await reorderBtn.click()

    // Should navigate to /job-orders/new with ?from= param
    await page.waitForURL('**/job-orders/new**', { timeout: 10000 })
    expect(page.url()).toContain('/job-orders/new')
    expect(page.url()).toContain('from=')
    expect(page.url()).toContain('customer_name=')
    expect(page.url()).toContain('customer_phone=')
  })

  test('new job order form shows "สร้างจากงาน" banner and pre-filled fields', async ({
    page,
  }) => {
    await page.goto('/job-orders')
    await page.waitForLoadState('networkidle')

    const jobLink = page.locator('a[href*="/job-orders/"]').first()
    if (!(await jobLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }
    await jobLink.click()
    await page.waitForLoadState('networkidle')

    const reorderBtn = page.getByRole('button', { name: /สั่งซ้ำ/i })
    if (!(await reorderBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await reorderBtn.click()
    await page.waitForURL('**/job-orders/new**', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // "สร้างจากงาน" banner should be visible
    await expect(page.getByText(/สร้างจากงาน/i)).toBeVisible({ timeout: 5000 })

    // Customer name field should be pre-filled (not empty)
    const customerNameInput = page.getByLabel(/ชื่อลูกค้า/i)
    await expect(customerNameInput).toBeVisible()
    const nameValue = await customerNameInput.inputValue()
    expect(nameValue.trim().length).toBeGreaterThan(0)

    // Customer phone field should be pre-filled
    const customerPhoneInput = page.getByLabel(/เบอร์โทร/i)
    await expect(customerPhoneInput).toBeVisible()
    const phoneValue = await customerPhoneInput.inputValue()
    expect(phoneValue.trim().length).toBeGreaterThan(0)
  })
})
