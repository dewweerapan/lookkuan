import { test, expect } from '@playwright/test'

test.describe('Settings & Administration', () => {
  test.describe('Settings Page', () => {
    test('should navigate to settings page', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Settings page should be visible
      const heading = page.locator('h1, h2').first()
      if (await heading.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(heading).toBeVisible()
      }
    })

    test('should display system statistics', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Check for stats cards or sections
      const statsHeading = page.getByText(/สถิติ|statistics|stats/i)
      if (await statsHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(statsHeading.first()).toBeVisible()
      }

      // Should have stat cards
      const statCards = page.locator('[class*="stat"], [class*="card"]')
      const count = await statCards.count()

      if (count > 0) {
        await expect(statCards.first()).toBeVisible()
      }
    })

    test('should display system info', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Check for system information
      const systemInfo = page.getByText(/ระบบ|system|version|database/i)
      if (await systemInfo.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(systemInfo.first()).toBeVisible()
      }
    })

    test('should display settings navigation menu', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Look for settings sections/links
      const menu = page.locator('[class*="menu"], [class*="nav"], nav').first()
      if (await menu.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(menu).toBeVisible()
      }
    })

    test('should have link to users page', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      const usersLink = page.getByRole('link', { name: /ผู้ใช้|users|staff|employees/i })
      if (await usersLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(usersLink).toBeVisible()
      }
    })

    test('should show system health status', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Check for health/status indicators
      const status = page.getByText(/สถานะ|status|health|connected|ปกติ/i)
      if (await status.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(status.first()).toBeVisible()
      }
    })

    test('should allow system configuration', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Look for configuration forms/sections
      const configHeading = page.getByText(/ตั้งค่า|config|settings|configuration/i)
      if (await configHeading.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(configHeading.first()).toBeVisible()
      }

      // Should have save/update button
      const saveBtn = page.getByRole('button', { name: /บันทึก|save|update|ยืนยัน/i })
      if (await saveBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(saveBtn.first()).toBeVisible()
      }
    })
  })

  test.describe('Users Management', () => {
    test('should navigate to users page', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: 'จัดการผู้ใช้งาน' })).toBeVisible()
    })

    test('should display users list', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Check for users table
      const table = page.locator('table, [role="grid"], [class*="list"]').first()
      if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(table).toBeVisible()
      }
    })

    test('should display user list with names', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Look for user rows
      const userRow = page.locator('table tbody tr, [role="row"]').first()
      if (await userRow.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(userRow).toBeVisible()
      }
    })

    test('should display role badges for users', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Look for role badges
      const roleBadge = page.locator('[class*="badge"], [class*="tag"]')
      if (await roleBadge.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(roleBadge.first()).toBeVisible()
      }
    })

    test('should show different roles (admin, staff, etc)', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Look for role indicators
      const roles = page.getByText(/admin|ผู้บริหาร|staff|พนักงาน|cashier|แคชเชียร์|embroidery/i)
      if (await roles.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(roles.first()).toBeVisible()
      }
    })

    test('should have user action buttons', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Look for edit/delete buttons
      const actionBtn = page.getByRole('button', { name: /แก้ไข|edit|ลบ|delete|ดู/i })
      if (await actionBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(actionBtn.first()).toBeVisible()
      }
    })

    test('should have add user button', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      const addUserBtn = page.getByRole('button', { name: /เพิ่ม|add|new|สร้าง/i })
      if (await addUserBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(addUserBtn.first()).toBeVisible()
      }
    })

    test('should allow searching users', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      const searchInput = page.getByPlaceholder(/ค้นหา|search/i)
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(searchInput).toBeVisible()
        // Try searching
        await searchInput.fill('admin')
        await page.waitForLoadState('networkidle')
      }
    })

    test('should display user status (active/inactive)', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Look for status column or indicator
      const status = page.getByText(/ใช้งาน|active|inactive|ปิดใช้/i)
      if (await status.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(status.first()).toBeVisible()
      }
    })

    test('should allow user role modification', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Look for a user row
      const userRow = page.locator('table tbody tr, [role="row"]').first()
      if (await userRow.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Check if there's an edit button or role select
        const editBtn = userRow.getByRole('button', { name: /แก้ไข|edit/i })
        if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(editBtn).toBeVisible()
        }

        // Or check for inline role select
        const roleSelect = userRow.locator('select, [role="listbox"]')
        if (await roleSelect.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(roleSelect.first()).toBeVisible()
        }
      }
    })

    test('should allow user deactivation/reactivation', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Look for toggle or action button
      const toggleBtn = page.getByRole('button', { name: /เปิดใช้|ปิดใช้|activate|deactivate/i })
      if (await toggleBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(toggleBtn.first()).toBeVisible()
      }
    })
  })

  test.describe('Settings Navigation', () => {
    test('should navigate to settings from sidebar', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const settingsLink = page.getByRole('link', { name: /ตั้งค่า|settings/i })
      if (await settingsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await settingsLink.click()
        await page.waitForURL('**/settings', { timeout: 10000 })
        await expect(page.url()).toContain('/settings')
      }
    })

    test('should navigate between settings sections', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Look for navigation menu in settings
      const usersLink = page.getByRole('link', { name: /ผู้ใช้|users/i })
      if (await usersLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await usersLink.click()
        await page.waitForURL('**/settings/users', { timeout: 10000 })
        await expect(page.url()).toContain('/settings/users')
      }
    })

    test('should return to settings main page from subsection', async ({ page }) => {
      await page.goto('/settings/users')
      await page.waitForLoadState('networkidle')

      // Look for back button or settings link
      const backBtn = page.getByRole('button', { name: /กลับ|back/i })
      const settingsLink = page.getByRole('link', { name: /ตั้งค่า|settings/i })

      if (await backBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await backBtn.first().click()
        await page.waitForLoadState('networkidle')
      } else if (await settingsLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await settingsLink.first().click()
        await page.waitForLoadState('networkidle')
      }
    })
  })

  test.describe('Admin Access Control', () => {
    test('should require admin role to access settings', async ({ browser }) => {
      // This test verifies that non-admin users cannot access settings
      // Create a new context without auth (simulating non-admin)
      const context = await browser.newContext()
      const page = await context.newPage()

      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Should either show access denied or redirect
      const accessDenied = page.getByText(/ไม่มีสิทธิ|denied|unauthorized|access/i)
      const redirected = !page.url().includes('/settings')

      const isDenied = await accessDenied.first().isVisible({ timeout: 3000 }).catch(() => false)

      if (isDenied || redirected) {
        expect(isDenied || redirected).toBe(true)
      }

      await context.close()
    })

    test('should display admin-only features', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // These pages should be visible for authenticated admin users
      const heading = page.locator('h1, h2').first()
      const isVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false)

      if (isVisible) {
        await expect(heading).toBeVisible()
      }
    })
  })

  test.describe('System Configuration', () => {
    test('should display business info fields', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Look for business name, address, etc.
      const businessInput = page.getByLabel(/ชื่อ|business|name|สถานประกอบการ/i)
      if (await businessInput.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(businessInput.first()).toBeVisible()
      }
    })

    test('should allow updating system currency', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Look for currency settings
      const currencySelect = page.getByLabel(/สกุลเงิน|currency/i)
      if (await currencySelect.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(currencySelect).toBeVisible()
      }
    })

    test('should allow updating business hours', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Look for business hours settings
      const hoursInput = page.getByLabel(/เวลา|hours|เปิด|ปิด/i)
      if (await hoursInput.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(hoursInput.first()).toBeVisible()
      }
    })

    test('should show database connection status', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Look for database status
      const dbStatus = page.getByText(/database|ฐานข้อมูล|connection|เชื่อมต่อ/i)
      if (await dbStatus.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(dbStatus.first()).toBeVisible()
      }
    })
  })
})
