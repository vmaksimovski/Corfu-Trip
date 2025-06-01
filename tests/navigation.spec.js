import { test, expect } from '@playwright/test';

test.describe('Destination Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    // Wait for map to be fully loaded
    await page.waitForFunction(() => window.map && window.map._loaded);
  });

  test('should start journey when clicking Start Journey button', async ({ page }) => {
    // Click the start journey button
    await page.click('button:has-text("Start Journey")');
    
    // Wait for first destination to become active
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Check that start screen is hidden
    await expect(page.locator('.destination.start-screen')).toHaveCSS('display', 'none');
    
    // Verify first destination content
    const firstDestination = page.locator('.destination[data-index="0"].active');
    await expect(firstDestination.locator('h3')).toHaveText('Arrive at the Corfu Ferry Port');
    await expect(firstDestination.locator('.country')).toContainText('Greece');
  });

  test('should navigate between destinations using next/previous buttons', async ({ page }) => {
    // Start the journey
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Click next button
    await page.click('.destination.active .nav-button:has-text("Next")');
    
    // Check second destination is now active
    await expect(page.locator('.destination[data-index="1"].active')).toBeVisible();
    const secondDestination = page.locator('.destination[data-index="1"].active');
    await expect(secondDestination.locator('h3')).toHaveText('Lunch at Mikro Cafe');
    
    // Click previous button
    await page.click('.destination.active .nav-button:has-text("Previous")');
    
    // Check first destination is active again
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
  });

  test('should disable navigation buttons at boundaries', async ({ page }) => {
    // Start journey (first destination)
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Previous button should be disabled on first destination
    const prevButton = page.locator('.destination.active .nav-button:has-text("Previous")');
    await expect(prevButton).toBeDisabled();
    
    // Navigate to last destination
    const destinationCount = await page.locator('.destination[data-index]').count();
    for (let i = 0; i < destinationCount - 1; i++) {
      await page.click('.destination.active .nav-button:has-text("Next")');
      await page.waitForTimeout(100); // Small delay for animation
    }
    
    // Next button should be disabled on last destination
    const nextButton = page.locator('.destination.active .nav-button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
  });

  test('should show correct destination states (previous, active, next)', async ({ page }) => {
    // Start journey and navigate to second destination
    await page.click('button:has-text("Start Journey")');
    await page.click('.destination.active .nav-button:has-text("Next")');
    
    // Wait for second destination to be active
    await expect(page.locator('.destination[data-index="1"].active')).toBeVisible();
    
    // Check destination states
    await expect(page.locator('.destination[data-index="0"].previous')).toBeVisible();
    await expect(page.locator('.destination[data-index="1"].active')).toBeVisible();
    await expect(page.locator('.destination[data-index="2"].next')).toBeVisible();
    
    // Other destinations should be hidden
    await expect(page.locator('.destination[data-index="3"].hidden')).toBeVisible();
  });

  test('should show navigation info with correct position', async ({ page }) => {
    // Start journey
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Check navigation info shows correct position
    const navInfo = page.locator('.destination.active .nav-info');
    await expect(navInfo).toHaveText('1 of 31');
    
    // Navigate to next destination
    await page.click('.destination.active .nav-button:has-text("Next")');
    await expect(page.locator('.destination[data-index="1"].active')).toBeVisible();
    
    // Check updated position
    await expect(page.locator('.destination.active .nav-info')).toHaveText('2 of 31');
  });

  test('should handle clicking on destination cards to navigate', async ({ page }) => {
    // Start journey
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Click on the next destination card (should be visible with .next class)
    await page.click('.destination[data-index="2"].next');
    
    // Should navigate to that destination
    await expect(page.locator('.destination[data-index="2"].active')).toBeVisible();
  });

  test('should maintain consistent navigation state across page interactions', async ({ page }) => {
    // Start journey and navigate a few steps
    await page.click('button:has-text("Start Journey")');
    await page.click('.destination.active .nav-button:has-text("Next")');
    await page.click('.destination.active .nav-button:has-text("Next")');
    
    // Should be on third destination
    await expect(page.locator('.destination[data-index="2"].active')).toBeVisible();
    
    // Click on map (should not affect navigation state)
    await page.click('#map');
    
    // Destination should still be active
    await expect(page.locator('.destination[data-index="2"].active')).toBeVisible();
  });

  test('should display country-specific styling for active destinations', async ({ page }) => {
    // Start journey (Greece destination)
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Check Greece styling
    const greekDestination = page.locator('.destination[data-index="0"].active[data-country="Greece"]');
    await expect(greekDestination).toBeVisible();
    
    // Navigate to Albania destination (around index 20-25 based on the data)
    for (let i = 0; i < 21; i++) {
      await page.click('.destination.active .nav-button:has-text("Next")');
      await page.waitForTimeout(50);
    }
    
    // Check Albania styling
    const albaniaDestination = page.locator('.destination.active[data-country="Albania"]');
    await expect(albaniaDestination).toBeVisible();
  });
});