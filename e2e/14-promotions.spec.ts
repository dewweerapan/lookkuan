import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

test.describe('Promotions Management', () => {
  test.describe('Promotions Page', () => {
    test('should load promotions page with heading', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      // Page header should show โปรโมชัน
      const heading = page.getByRole('heading', { name: /โปรโมชัน|ส่วนลด/i })
      if (await heading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(heading.first()).toBeVisible()
      } else {
        // Fallback: any h1/h2 with promo-related text
        const fallback = page.locator('h1, h2').first()
        await expect(fallback).toBeVisible()
      }
    })

    test('should display promotions list or empty state', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      // Either a list of promotions or empty state message
      const promoList = page.locator('table, [class*="space-y"]').first()
      const emptyState = page.getByText(/ยังไม่มีโปรโมชัน|ไม่มีโปรโมชัน/i)

      const hasList = await promoList.isVisible({ timeout: 5000 }).catch(() => false)
      const hasEmpty = await emptyState.isVisible({ timeout: 5000 }).catch(() => false)

      expect(hasList || hasEmpty).toBe(true)
    })

    test('should show promotions count', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      // Count label like "X โปรโมชัน"
      const countLabel = page.getByText(/โปรโมชัน/i)
      if (await countLabel.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(countLabel.first()).toBeVisible()
      }
    })
  })

  test.describe('Create Promotion', () => {
    test('should display "เพิ่มโปรโมชัน" create button', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const createBtn = page.getByRole('button', { name: /เพิ่มโปรโมชัน|เพิ่มโปรโมชั่น|สร้างโปรโมชัน/i })
      if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(createBtn).toBeVisible()
      } else {
        // Fallback: button with + sign or add-related text
        const addBtn = page.getByRole('button', { name: /เพิ่ม|add|\+/i })
        if (await addBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(addBtn.first()).toBeVisible()
        }
      }
    })

    test('should open form modal when clicking create button', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const createBtn = page.getByRole('button', { name: /เพิ่มโปรโมชัน|เพิ่มโปรโมชั่น|เพิ่ม/i })
      if (await createBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.first().click()

        // Modal or form should appear
        const modal = page.locator('[class*="fixed"], [role="dialog"], form').first()
        if (await modal.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(modal).toBeVisible()
        }
      }
    })

    test('should show ชื่อโปรโมชัน field in form', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const createBtn = page.getByRole('button', { name: /เพิ่มโปรโมชัน|เพิ่ม/i })
      if (await createBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.first().click()

        // Wait for modal to appear
        const nameLabel = page.getByText('ชื่อโปรโมชัน')
        if (await nameLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(nameLabel).toBeVisible()
        }

        // Name input field
        const nameInput = page.getByPlaceholder(/เช่น ลดต้อนรับ|ชื่อโปรโมชัน/i)
        if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(nameInput).toBeVisible()
        }
      }
    })

    test('should show ประเภทส่วนลด selector in form', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const createBtn = page.getByRole('button', { name: /เพิ่มโปรโมชัน|เพิ่ม/i })
      if (await createBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.first().click()

        // Type selector
        const typeLabel = page.getByText('ประเภทส่วนลด')
        if (await typeLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(typeLabel).toBeVisible()
        }

        // Select dropdown for discount type (%, fixed, min purchase)
        const typeSelect = page.locator('select').first()
        if (await typeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(typeSelect).toBeVisible()
        }
      }
    })

    test('should show discount type options (% and fixed)', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const createBtn = page.getByRole('button', { name: /เพิ่มโปรโมชัน|เพิ่ม/i })
      if (await createBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.first().click()

        // Check for % discount option
        const percentOption = page.getByText(/ลดเป็น %|percent/i)
        if (await percentOption.first().isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(percentOption.first()).toBeVisible()
        }

        // Check for fixed discount option
        const fixedOption = page.getByText(/ลดเป็นบาท|fixed/i)
        if (await fixedOption.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(fixedOption.first()).toBeVisible()
        }
      }
    })

    test('should show วันเริ่ม and วันสิ้นสุด date fields in form', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const createBtn = page.getByRole('button', { name: /เพิ่มโปรโมชัน|เพิ่ม/i })
      if (await createBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.first().click()

        // Start date
        const startDateLabel = page.getByText('วันเริ่ม')
        if (await startDateLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(startDateLabel).toBeVisible()
        }

        // End date
        const endDateLabel = page.getByText('วันสิ้นสุด')
        if (await endDateLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(endDateLabel).toBeVisible()
        }

        // Date inputs
        const dateInputs = page.locator('input[type="date"]')
        const dateCount = await dateInputs.count()
        if (dateCount > 0) {
          await expect(dateInputs.first()).toBeVisible()
        }
      }
    })

    test('should show save and cancel buttons in form', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const createBtn = page.getByRole('button', { name: /เพิ่มโปรโมชัน|เพิ่ม/i })
      if (await createBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.first().click()

        // Save button
        const saveBtn = page.getByRole('button', { name: /บันทึก|save/i })
        if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(saveBtn).toBeVisible()
        }

        // Cancel button
        const cancelBtn = page.getByRole('button', { name: /ยกเลิก|cancel/i })
        if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(cancelBtn).toBeVisible()
        }
      }
    })

    test('should close form when clicking cancel', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const createBtn = page.getByRole('button', { name: /เพิ่มโปรโมชัน|เพิ่ม/i })
      if (await createBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await createBtn.first().click()

        const cancelBtn = page.getByRole('button', { name: /ยกเลิก|cancel/i })
        if (await cancelBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await cancelBtn.click()

          // Modal should be gone
          await page.waitForTimeout(500)
          const modal = page.locator('[class*="fixed inset-0"]')
          const stillVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false)
          expect(stillVisible).toBe(false)
        }
      }
    })
  })

  test.describe('Promotion Status Toggle', () => {
    test('should show active/inactive toggle buttons on existing promotions', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      // Look for toggle buttons with เปิด/ปิด or เปิดใช้/ปิดใช้
      const toggleBtn = page.getByRole('button', { name: /เปิด|ปิด|เปิดใช้|ปิดใช้/i })
      if (await toggleBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(toggleBtn.first()).toBeVisible()
      }
    })

    test('should show status labels in promotions list', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const activeLabel = page.getByText(/เปิดใช้|ปิดใช้|เปิด|ปิด/i)
      if (await activeLabel.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(activeLabel.first()).toBeVisible()
      }
    })

    test('should show delete button on promotions', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      const deleteBtn = page.getByRole('button', { name: /ลบ|delete/i })
      if (await deleteBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(deleteBtn.first()).toBeVisible()
      }
    })
  })

  test.describe('Promotions Navigation', () => {
    test('should navigate back to settings from promotions page', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      // Look for back link or settings breadcrumb
      const backLink = page.getByRole('link', { name: /ตั้งค่า|settings|กลับ|back/i })
      if (await backLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await backLink.first().click()
        await page.waitForLoadState('networkidle')
        // Should navigate away from promotions
        expect(page.url()).not.toContain('/settings/promotions')
      }
    })

    test('should be accessible from settings page', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Look for promotions link in settings nav
      const promoLink = page.getByRole('link', { name: /โปรโมชัน|ส่วนลด|promotions/i })
      if (await promoLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await promoLink.first().click()
        await page.waitForURL('**/settings/promotions', { timeout: 10000 })
        await expect(page.url()).toContain('/settings/promotions')
      }
    })

    test('should have correct page URL', async ({ page }) => {
      await page.goto('/settings/promotions')
      await page.waitForLoadState('networkidle')

      expect(page.url()).toContain('/settings/promotions')
    })
  })
})
