import { test, expect } from '@playwright/test';

test.describe('Page Loading and Initial State', () => {
  test('should load the page with correct title and basic elements', async ({ page }) => {
    await page.goto('/index.html');
    
    // Check page title
    await expect(page).toHaveTitle('2025 Summer Vacation');
    
    // Check main layout elements exist
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    
    // Check sidebar title
    await expect(page.locator('#sidebar h1')).toHaveText('Corfu & Sarandë Trip Itinerary');
    
    // Check destinations container exists
    await expect(page.locator('#destinations')).toBeVisible();
  });

  test('should show start screen initially', async ({ page }) => {
    await page.goto('/index.html');
    
    // Wait for the start screen to be visible
    const startScreen = page.locator('.destination.start-screen.active');
    await expect(startScreen).toBeVisible();
    
    // Check start screen content
    await expect(startScreen.locator('h2')).toHaveText('Ready to explore?');
    await expect(startScreen.locator('p')).toHaveText('Your Mediterranean adventure awaits');
    await expect(startScreen.locator('button')).toHaveText('Start Journey');
  });

  test('should initialize map', async ({ page }) => {
    await page.goto('/index.html');
    
    // Wait for map to load
    await page.waitForFunction(() => window.map && window.map._loaded);
    
    // Check if map canvas is present
    await expect(page.locator('#map canvas.mapboxgl-canvas')).toBeVisible();
    
    // Check if map controls are present
    await expect(page.locator('.mapboxgl-ctrl-group').first()).toBeVisible();
  });

  test('should load external dependencies', async ({ page }) => {
    await page.goto('/index.html');
    
    // Check if mapboxgl is loaded
    await page.waitForFunction(() => typeof window.mapboxgl !== 'undefined');
    
    // Check if Threebox is loaded  
    await page.waitForFunction(() => typeof window.Threebox !== 'undefined');
    
    // Check if THREE.js is loaded
    await page.waitForFunction(() => typeof window.THREE !== 'undefined');
  });

  test('should have correct initial map view', async ({ page }) => {
    await page.goto('/index.html');
    
    // Wait for map to be fully loaded
    await page.waitForFunction(() => window.map && window.map._loaded);
    
    // Check initial map center and zoom
    const mapCenter = await page.evaluate(() => {
      const center = window.map.getCenter();
      return { lng: center.lng, lat: center.lat };
    });
    
    const mapZoom = await page.evaluate(() => window.map.getZoom());
    
    // Verify initial position is centered between Corfu and Sarandë
    expect(mapCenter.lng).toBeCloseTo(19.95, 1);
    expect(mapCenter.lat).toBeCloseTo(39.75, 1);
    expect(mapZoom).toBeCloseTo(9.5, 1);
  });
});