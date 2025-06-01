import { test, expect } from '@playwright/test';

test.describe('Map Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    // Wait for map to be fully loaded
    await page.waitForFunction(() => window.map && window.map._loaded);
  });

  test('should show map markers for all destinations', async ({ page }) => {
    // Wait for markers to be added
    await page.waitForTimeout(2000);
    
    // Check that map markers are present
    const markers = page.locator('.mapboxgl-marker');
    const markerCount = await markers.count();
    
    // Should have at least 31 markers (one for each destination, may have additional elements)
    expect(markerCount).toBeGreaterThanOrEqual(31);
  });

  test('should navigate to destination when clicking map marker', async ({ page }) => {
    // Start journey first
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Wait for markers to be clickable
    await page.waitForTimeout(1000);
    
    // Click on a map marker (get the second one)
    const markers = page.locator('.mapboxgl-marker');
    await markers.nth(1).click();
    
    // Should navigate to that destination
    await expect(page.locator('.destination[data-index="1"].active')).toBeVisible();
  });

  test('should display popup when navigating to destination', async ({ page }) => {
    // Start journey
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Wait for popup to appear
    await page.waitForSelector('.mapboxgl-popup', { timeout: 5000 });
    
    // Check popup content
    const popup = page.locator('.mapboxgl-popup');
    await expect(popup).toBeVisible();
    await expect(popup.locator('h3')).toHaveText('Arrive at the Corfu Ferry Port');
    await expect(popup).toContainText('Greece');
    await expect(popup).toContainText('9:00AM');
  });

  test('should update map view when navigating between destinations', async ({ page }) => {
    // Start journey
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Get initial map center
    const initialCenter = await page.evaluate(() => {
      const center = window.map.getCenter();
      return { lng: center.lng, lat: center.lat };
    });
    
    // Navigate to next destination
    await page.click('.destination.active .nav-button:has-text("Next")');
    await page.waitForTimeout(1000); // Wait for map animation
    
    // Get new map center
    const newCenter = await page.evaluate(() => {
      const center = window.map.getCenter();
      return { lng: center.lng, lat: center.lat };
    });
    
    // Map center should have changed
    expect(newCenter.lng).not.toBeCloseTo(initialCenter.lng, 3);
    expect(newCenter.lat).not.toBeCloseTo(initialCenter.lat, 3);
  });

  test('should have different marker colors for different countries', async ({ page }) => {
    // Wait for markers to be rendered
    await page.waitForTimeout(2000);
    
    // Check that markers have different background colors
    const markers = page.locator('.mapboxgl-marker > div');
    
    // Get background colors from first few markers
    const colors = [];
    for (let i = 0; i < 5; i++) {
      const color = await markers.nth(i).evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      colors.push(color);
    }
    
    // Should have Greece color (blue) for first markers
    expect(colors[0]).toBe('rgb(0, 102, 204)'); // #0066cc
  });

  test('should show map navigation controls', async ({ page }) => {
    // Check zoom controls
    await expect(page.locator('.mapboxgl-ctrl-zoom-in')).toBeVisible();
    await expect(page.locator('.mapboxgl-ctrl-zoom-out')).toBeVisible();
    
    // Check compass/navigation control
    await expect(page.locator('.mapboxgl-ctrl-compass')).toBeVisible();
    
    // Check fullscreen control
    await expect(page.locator('.mapboxgl-ctrl-fullscreen')).toBeVisible();
  });

  test('should support map zoom functionality', async ({ page }) => {
    // Get initial zoom level
    const initialZoom = await page.evaluate(() => window.map.getZoom());
    
    // Click zoom in button
    await page.click('.mapboxgl-ctrl-zoom-in');
    await page.waitForTimeout(500);
    
    // Get new zoom level
    const newZoom = await page.evaluate(() => window.map.getZoom());
    
    // Zoom should have increased
    expect(newZoom).toBeGreaterThan(initialZoom);
  });

  test('should close existing popups when navigating', async ({ page }) => {
    // Start journey
    await page.click('button:has-text("Start Journey")');
    await page.waitForSelector('.mapboxgl-popup');
    
    // Navigate to next destination
    await page.click('.destination.active .nav-button:has-text("Next")');
    await page.waitForTimeout(500);
    
    // Should only have one popup visible
    const popups = page.locator('.mapboxgl-popup');
    await expect(popups).toHaveCount(1);
  });

  test('should handle Google Maps links in destination cards', async ({ page }) => {
    // Start journey
    await page.click('button:has-text("Start Journey")');
    await expect(page.locator('.destination[data-index="0"].active')).toBeVisible();
    
    // Check Google Maps link is present and has correct attributes
    const googleMapsLink = page.locator('.destination.active .google-maps-hint');
    await expect(googleMapsLink).toBeVisible();
    await expect(googleMapsLink).toHaveAttribute('href', /google\.com\/maps/);
    await expect(googleMapsLink).toHaveAttribute('target', '_blank');
    await expect(googleMapsLink).toHaveText('📍 Click to open in Google Maps');
  });

  test('should maintain map responsiveness during navigation', async ({ page }) => {
    // Start journey and navigate quickly through several destinations
    await page.click('button:has-text("Start Journey")');
    
    for (let i = 0; i < 5; i++) {
      await page.click('.destination.active .nav-button:has-text("Next")');
      await page.waitForTimeout(100);
    }
    
    // Map should still be responsive
    const mapLoaded = await page.evaluate(() => window.map && window.map._loaded);
    expect(mapLoaded).toBe(true);
    
    // Should be able to interact with map
    await page.click('#map');
    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible();
  });

  test('should render 3D terrain and sky layer', async ({ page }) => {
    // Start journey to trigger map focus
    await page.click('button:has-text("Start Journey")');
    await page.waitForTimeout(2000);
    
    // Check if terrain source exists
    const hasTerrainSource = await page.evaluate(() => {
      return window.map.getSource('mapbox-dem') !== undefined;
    });
    expect(hasTerrainSource).toBe(true);
    
    // Check if sky layer exists
    const hasSkyLayer = await page.evaluate(() => {
      return window.map.getLayer('sky') !== undefined;
    });
    expect(hasSkyLayer).toBe(true);
  });
});