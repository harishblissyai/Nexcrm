import { test, expect } from '@playwright/test'

async function loginAsNewUser(page) {
  const email = `leads_${Date.now()}@nexcrm.io`
  await page.goto('/login')
  await page.getByRole('button', { name: 'Register' }).click()
  await page.getByPlaceholder('Jane Doe').fill('Leads Tester')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('pass1234')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('Leads', () => {
  test('shows leads page', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/leads')
    await expect(page.getByText('Leads')).toBeVisible()
    await expect(page.getByRole('button', { name: /New Lead/ })).toBeVisible()
  })

  test('creates a new lead', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/leads')
    await page.getByRole('button', { name: /New Lead/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByPlaceholder('Lead title').fill('Enterprise Deal')
    await page.getByLabel('Status').selectOption('Qualified')
    await page.getByPlaceholder('0.00').fill('50000')
    await page.getByRole('button', { name: 'Save Lead' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Enterprise Deal')).toBeVisible()
    await expect(page.getByText('Qualified')).toBeVisible()
  })

  test('validates required title field', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/leads')
    await page.getByRole('button', { name: /New Lead/ }).click()
    await page.getByRole('button', { name: 'Save Lead' }).click()
    await expect(page.getByText('Title is required')).toBeVisible()
  })

  test('filters leads by status', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/leads')

    // Create leads with different statuses
    for (const [title, status] of [['NewLead', 'New'], ['QualifiedLead', 'Qualified']]) {
      await page.getByRole('button', { name: /New Lead/ }).click()
      await page.getByPlaceholder('Lead title').fill(title)
      await page.getByLabel('Status').selectOption(status)
      await page.getByRole('button', { name: 'Save Lead' }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    }

    await page.getByRole('button', { name: 'Qualified' }).first().click()
    await expect(page.getByText('QualifiedLead')).toBeVisible()
    await expect(page.getByText('NewLead')).not.toBeVisible()
  })

  test('navigates to lead detail', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/leads')
    await page.getByRole('button', { name: /New Lead/ }).click()
    await page.getByPlaceholder('Lead title').fill('Detail Lead')
    await page.getByRole('button', { name: 'Save Lead' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: 'Detail Lead' }).click()
    await expect(page).toHaveURL(/\/leads\/\d+/)
    await expect(page.getByText('Detail Lead')).toBeVisible()
  })

  test('updates lead status from detail page', async ({ page }) => {
    await loginAsNewUser(page)
    await page.goto('/leads')
    await page.getByRole('button', { name: /New Lead/ }).click()
    await page.getByPlaceholder('Lead title').fill('Status Lead')
    await page.getByRole('button', { name: 'Save Lead' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Status Lead' }).click()

    await page.getByRole('button', { name: 'Contacted' }).click()
    await expect(page.getByText('Contacted')).toBeVisible({ timeout: 5000 })
  })
})
