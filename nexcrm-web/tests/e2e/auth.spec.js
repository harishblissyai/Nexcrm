import { test, expect } from '@playwright/test'

const TEST_USER = {
  email: `e2e_${Date.now()}@nexcrm.io`,
  full_name: 'E2E User',
  password: 'test1234',
}

test.describe('Authentication', () => {
  test('shows login page on root', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('NexCRM')).toBeVisible()
  })

  test('switches between login and register', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Register' }).click()
    await expect(page.getByPlaceholder('Jane Doe')).toBeVisible()
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByPlaceholder('Jane Doe')).not.toBeVisible()
  })

  test('register and auto-login', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Register' }).click()
    await page.getByPlaceholder('Jane Doe').fill(TEST_USER.full_name)
    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email)
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('login with valid credentials', async ({ page }) => {
    // First register
    await page.goto('/login')
    await page.getByRole('button', { name: 'Register' }).click()
    const email = `login_${Date.now()}@nexcrm.io`
    await page.getByPlaceholder('Jane Doe').fill('Login Test')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('••••••••').fill('pass1234')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Logout
    await page.getByTitle('Logout').click()
    await expect(page).toHaveURL(/\/login/)

    // Re-login
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('••••••••').fill('pass1234')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill('nobody@nexcrm.io')
    await page.getByPlaceholder('••••••••').fill('wrongpass')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText(/Invalid|error|wrong/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('logout clears session', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Register' }).click()
    const email = `logout_${Date.now()}@nexcrm.io`
    await page.getByPlaceholder('Jane Doe').fill('Logout User')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('••••••••').fill('pass1234')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await page.getByTitle('Logout').click()
    await page.goto('/contacts')
    await expect(page).toHaveURL(/\/login/)
  })
})
