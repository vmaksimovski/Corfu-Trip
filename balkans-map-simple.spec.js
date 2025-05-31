const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('3D Balkans Map - Core Tests', () => {
  test('should load and display all elements', async ({ page }) => {
    const filePath = path.join(__dirname, 'balkans-3d-map.html');
    await page.goto(`file://${filePath}`);
    
    // Check title
    await expect(page).toHaveTitle('3D Interactive Balkans Map');
    
    // Check sidebar is visible
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#sidebar h1')).toHaveText('Top 10 Balkan Destinations');
    
    // Wait for destinations to load
    await page.waitForSelector('.destination', { timeout: 5000 });
    
    // Check all 10 destinations are present
    const destinations = await page.locator('.destination').count();
    expect(destinations).toBe(10);
    
    // Check first destination content
    const firstDest = await page.locator('.destination').first();
    await expect(firstDest).toContainText('1. Dubrovnik');
    await expect(firstDest).toContainText('Croatia');
    
    // Check map container is visible
    await expect(page.locator('#map')).toBeVisible();
    
    // Wait for Mapbox to initialize
    await page.waitForFunction(() => {
      return window.mapboxgl && window.map;
    }, { timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
  });

  test('should handle destination clicks', async ({ page }) => {
    const filePath = path.join(__dirname, 'balkans-3d-map.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for destinations
    await page.waitForSelector('.destination');
    
    // Get initial map state
    const initialState = await page.evaluate(() => {
      const map = window.map;
      return {
        zoom: map.getZoom(),
        center: map.getCenter()
      };
    });
    
    // Click on first destination (Dubrovnik)
    await page.locator('.destination').first().click();
    
    // Wait for animation
    await page.waitForTimeout(4000);
    
    // Check if map moved
    const newState = await page.evaluate(() => {
      const map = window.map;
      return {
        zoom: map.getZoom(),
        center: map.getCenter()
      };
    });
    
    // Zoom should be higher (closer view)
    expect(newState.zoom).toBeGreaterThan(initialState.zoom);
    
    // Center should have changed
    expect(newState.center.lng).not.toBe(initialState.center.lng);
    expect(newState.center.lat).not.toBe(initialState.center.lat);
    
    // Check for popup
    await expect(page.locator('.mapboxgl-popup')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.mapboxgl-popup')).toContainText('Dubrovnik');
  });

  test('should have working navigation controls', async ({ page }) => {
    const filePath = path.join(__dirname, 'balkans-3d-map.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for map initialization and controls to be added
    await page.waitForFunction(() => {
      return window.map && document.querySelector('.mapboxgl-ctrl-zoom-in');
    }, { timeout: 10000 });
    
    // Check navigation controls exist
    await page.waitForSelector('.mapboxgl-ctrl-zoom-in', { timeout: 5000 });
    
    // Get initial zoom
    const initialZoom = await page.evaluate(() => window.map.getZoom());
    
    // Click zoom in
    await page.locator('.mapboxgl-ctrl-zoom-in').click();
    await page.waitForTimeout(500);
    
    // Check zoom increased
    const newZoom = await page.evaluate(() => window.map.getZoom());
    expect(newZoom).toBeGreaterThan(initialZoom);
  });

  test('should display markers', async ({ page }) => {
    const filePath = path.join(__dirname, 'balkans-3d-map.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for markers
    await page.waitForSelector('.mapboxgl-marker', { timeout: 10000 });
    
    // Count markers
    const markerCount = await page.locator('.mapboxgl-marker').count();
    expect(markerCount).toBeGreaterThanOrEqual(10);
  });

  test('should handle hover effects', async ({ page }) => {
    const filePath = path.join(__dirname, 'balkans-3d-map.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for destinations
    await page.waitForSelector('.destination');
    
    const destination = page.locator('.destination').first();
    
    // Get initial style
    const initialBg = await destination.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Hover
    await destination.hover();
    await page.waitForTimeout(100);
    
    // Get hover style
    const hoverBg = await destination.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Background should change on hover
    expect(hoverBg).not.toBe(initialBg);
  });
});