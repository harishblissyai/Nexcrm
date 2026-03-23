import { test, expect } from '@playwright/test'

async function loginAsNewUser(page) {
  const email = `act_${Date.now()}@nexcrm.io`
  await page.goto('/login')
  await page.getByRole('button', { name: 'Register' }).click()
  await page.getByPlaceholder('Jane Doe').fill('Activity Tester')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('pass1234')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('Activities', () => {
  test('shows activities page', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/activities')
    await expect(page.getByText('Activities')).toBeVisible()
    await expect(page.getByRole('button', { name: /Log Activity/ })).toBeVisible()
  })

  test('logs a new activity', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/activities')
    await page.getByRole('button', { name: /Log Activity/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByLabel('Type').selectOption('Meeting')
    await page.locator('input[placeholder="Activity subject"]').fill('Kickoff meeting')
    await page.locator('textarea[placeholder="Details…"]').fill('Discussed project scope')
    await page.getByRole('button', { name: 'Save Activity' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Kickoff meeting')).toBeVisible()
    await expect(page.getByText(/Meeting/)).toBeVisible()
  })

  test('validates required subject field', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/activities')
    await page.getByRole('button', { name: /Log Activity/ }).click()
    await page.getByRole('button', { name: 'Save Activity' }).click()
    await expect(page.getByText('Subject is required')).toBeVisible()
  })

  test('deletes an activity', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/activities')
    await page.getByRole('button', { name: /Log Activity/ }).click()
    await page.locator('input[placeholder="Activity subject"]').fill('Delete Me Activity')
    await page.getByRole('button', { name: 'Save Activity' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Delete Me Activity')).toBeVisible()

    page.on('dialog', d => d.accept())
    // Click trash icon in row
    await page.locator('tr').filter({ hasText: 'Delete Me Activity' }).getByRole('button').last().click()
    await expect(page.getByText('Delete Me Activity')).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('Dashboard', () => {
  test('shows stats on dashboard', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/dashboard')
    await expect(page.getByText('Total Contacts')).toBeVisible()
    await expect(page.getByText('Total Leads')).toBeVisible()
    await expect(page.getByText('Lead Pipeline')).toBeVisible()
    await expect(page.getByText('Recent Activities')).toBeVisible()
  })

  test('global search returns results', async ({ page }) => {
    await loginAsNewUser(page)
    // Create a contact first
    await page.goto('/contacts')
    await page.getByRole('button', { name: /New Contact/ }).click()
    await page.getByPlaceholder('Full name').fill('GlobalSearchPerson')
    await page.getByRole('button', { name: 'Save Contact' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    // Use global search in navbar
    await page.goto('/dashboard')
    await page.getByPlaceholder('Search contacts, leads…').fill('GlobalSearchPerson')
    await page.keyboard.press('Enter')
    await expect(page.getByText('GlobalSearchPerson')).toBeVisible({ timeout: 5000 })
  })
})
