import { test as setup, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL || 'jizrix@gmail.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Itl0stall'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')

  // Fill login form using IDs
  await page.locator('#email').fill(TEST_EMAIL)
  await page.locator('#password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 30000 })
  await expect(page.getByRole('heading', { name: 'หน้าหลัก' })).toBeVisible()

  // Wait for role to be cached in localStorage (needed for sidebar role-restricted items)
  // The useAuth hook fetches the profile async and caches role in localStorage
  await page.waitForFunction(
    () => localStorage.getItem('lk_user_role') !== null,
    { timeout: 15000 }
  ).catch(() => {
    // If role not cached, log a warning but continue
    console.warn('Role not cached in localStorage after 15s')
  })

  // Save auth state (includes both cookies and localStorage)
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
