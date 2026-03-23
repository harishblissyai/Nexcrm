import { test, expect } from '@playwright/test'

async function loginAsNewUser(page) {
  const email = `contact_${Date.now()}@nexcrm.io`
  await page.goto('/login')
  await page.getByRole('button', { name: 'Register' }).click()
  await page.getByPlaceholder('Jane Doe').fill('Contact Tester')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('pass1234')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('Contacts', () => {
  test('shows contacts page', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/contacts')
    await expect(page.getByText('Contacts')).toBeVisible()
    await expect(page.getByRole('button', { name: /New Contact/ })).toBeVisible()
  })

  test('creates a new contact', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/contacts')
    await page.getByRole('button', { name: /New Contact/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByPlaceholder('Full name').fill('Alice Smith')
    await page.getByPlaceholder('email@company.com').fill('alice@acme.com')
    await page.getByPlaceholder('Company name').fill('Acme Corp')
    await page.getByRole('button', { name: 'Save Contact' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Alice Smith')).toBeVisible()
  })

  test('validates required name field', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/contacts')
    await page.getByRole('button', { name: /New Contact/ }).click()
    await page.getByRole('button', { name: 'Save Contact' }).click()
    await expect(page.getByText('Name is required')).toBeVisible()
  })

  test('searches contacts', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/contacts')

    // Create two contacts
    for (const name of ['SearchableAbc', 'SomethingElse']) {
      await page.getByRole('button', { name: /New Contact/ }).click()
      await page.getByPlaceholder('Full name').fill(name)
      await page.getByRole('button', { name: 'Save Contact' }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    }

    await page.getByPlaceholder('Search contacts…').fill('SearchableAbc')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText('SearchableAbc')).toBeVisible()
    await expect(page.getByText('SomethingElse')).not.toBeVisible()
  })

  test('edits a contact', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/contacts')
    await page.getByRole('button', { name: /New Contact/ }).click()
    await page.getByPlaceholder('Full name').fill('Old Name')
    await page.getByRole('button', { name: 'Save Contact' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: '' }).first().click() // pencil icon
    await page.getByPlaceholder('Full name').fill('New Name')
    await page.getByRole('button', { name: 'Save Contact' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText('New Name')).toBeVisible()
  })

  test('navigates to contact detail', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/contacts')
    await page.getByRole('button', { name: /New Contact/ }).click()
    await page.getByPlaceholder('Full name').fill('Detail Test')
    await page.getByPlaceholder('Company name').fill('TestCorp')
    await page.getByRole('button', { name: 'Save Contact' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: 'Detail Test' }).click()
    await expect(page).toHaveURL(/\/contacts\/\d+/)
    await expect(page.getByText('Detail Test')).toBeVisible()
    await expect(page.getByText('TestCorp')).toBeVisible()
  })
})
