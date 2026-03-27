import { test as setup, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL || 'jizrix@gmail.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'test123456'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')

  // Fill login form
  await page.getByLabel('อีเมล').fill(TEST_EMAIL)
  await page.getByLabel('รหัสผ่าน').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await expect(page.getByText('หน้าหลัก')).toBeVisible()

  // Save auth state
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
