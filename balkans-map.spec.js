const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('3D Interactive Balkans Map', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    const filePath = path.join(__dirname, 'balkans-3d-map.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for map to initialize and DOM to be ready
    await page.waitForFunction(() => {
      return window.mapboxgl && 
             document.querySelector('.mapboxgl-map') && 
             document.querySelectorAll('.destination').length === 37;
    }, { timeout: 10000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load the page with correct title', async () => {
    await expect(page).toHaveTitle('3D Interactive Balkans Map');
  });

  test('should display sidebar with heading', async () => {
    const sidebar = await page.locator('#sidebar');
    await expect(sidebar).toBeVisible();
    
    const heading = await page.locator('#sidebar h1');
    await expect(heading).toHaveText('Corfu & Sarande Trip Itinerary');
  });

  test('should display all 37 destinations in sidebar', async () => {
    const destinations = await page.locator('.destination');
    await expect(destinations).toHaveCount(37);
    
    // Check specific destinations
    const expectedDestinations = [
      'Arrive at Corfu International Airport',
      'Lunch at Mikro Cafe',
      'Explore UNESCO Corfu Old Town',
      'Old Fortress (Palaio Frourio) Sunset',
      'Dinner at Salto Wine Bar & Bistro',
      'Achilleion Palace Visit',
      'Lunch at Limnopoula Fish Taverna',
      'Doukades Village Visit',
      'Dinner at Taverna Ninos',
      'Paleokastritsa Monastery'
    ];
    
    for (let i = 0; i < expectedDestinations.length; i++) {
      const destination = destinations.nth(i);
      await expect(destination).toContainText(expectedDestinations[i]);
    }
  });

  test('should have map container visible', async () => {
    const mapContainer = await page.locator('#map');
    await expect(mapContainer).toBeVisible();
    
    // Check if Mapbox GL canvas is present
    const mapCanvas = await page.locator('.mapboxgl-canvas');
    await expect(mapCanvas).toBeVisible();
  });

  test('should have navigation controls', async () => {
    // Wait for controls to load
    await page.waitForSelector('.mapboxgl-ctrl-nav-compass', { timeout: 5000 });
    
    const navControl = await page.locator('.mapboxgl-ctrl-nav-compass');
    await expect(navControl).toBeVisible();
    
    const zoomIn = await page.locator('.mapboxgl-ctrl-zoom-in');
    await expect(zoomIn).toBeVisible();
    
    const zoomOut = await page.locator('.mapboxgl-ctrl-zoom-out');
    await expect(zoomOut).toBeVisible();
  });

  test('should have fullscreen control', async () => {
    const fullscreenControl = await page.locator('.mapboxgl-ctrl-fullscreen');
    await expect(fullscreenControl).toBeVisible();
  });

  test('should highlight destination on hover', async () => {
    const firstDestination = await page.locator('.destination').first();
    
    // Get initial background color
    const initialBg = await firstDestination.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Hover over destination
    await firstDestination.hover();
    
    // Check if background color changed
    const hoverBg = await firstDestination.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    expect(initialBg).not.toBe(hoverBg);
  });

  test('should fly to destination when clicked', async () => {
    // Get initial map center
    const getMapCenter = () => page.evaluate(() => {
      const map = window.map || document.querySelector('.mapboxgl-map')._mapboxgl;
      const center = map.getCenter();
      return { lng: center.lng, lat: center.lat };
    });
    
    // Wait for map to be ready
    await page.waitForTimeout(2000);
    
    // Click on first destination
    const firstDestination = await page.locator('.destination').first();
    await firstDestination.click();
    
    // Wait for fly animation
    await page.waitForTimeout(4000);
    
    // Check if popup appears
    const popup = await page.locator('.mapboxgl-popup');
    await expect(popup).toBeVisible({ timeout: 5000 });
    await expect(popup).toContainText('Arrive at Corfu International Airport');
  });

  test('should display markers on map', async () => {
    // Wait for markers to load
    await page.waitForSelector('.mapboxgl-marker', { timeout: 5000 });
    
    const markers = await page.locator('.mapboxgl-marker');
    const markerCount = await markers.count();
    
    // Should have at least 37 markers (one for each destination)
    expect(markerCount).toBeGreaterThanOrEqual(37);
  });

  test('should have 3D terrain enabled', async () => {
    // Check if terrain source is added
    const hasTerrain = await page.evaluate(() => {
      const map = window.map || document.querySelector('.mapboxgl-map')._mapboxgl;
      return map.getSource('mapbox-dem') !== undefined;
    });
    
    expect(hasTerrain).toBeTruthy();
  });

  test('should zoom in when zoom in button is clicked', async () => {
    // Get initial zoom level
    const getZoom = () => page.evaluate(() => {
      const map = window.map || document.querySelector('.mapboxgl-map')._mapboxgl;
      return map.getZoom();
    });
    
    const initialZoom = await getZoom();
    
    // Click zoom in
    const zoomIn = await page.locator('.mapboxgl-ctrl-zoom-in');
    await zoomIn.click();
    
    // Wait for zoom animation
    await page.waitForTimeout(500);
    
    const newZoom = await getZoom();
    expect(newZoom).toBeGreaterThan(initialZoom);
  });

  test('should display destination details correctly', async () => {
    // Wait for the first destination to be active
    await page.waitForSelector('.destination.active');
    const activeDestination = await page.locator('.destination.active');
    
    // Check structure
    const heading = await activeDestination.locator('h3');
    await expect(heading).toContainText('Arrive at Corfu International Airport');
    
    const countryInfo = await activeDestination.locator('.country');
    await expect(countryInfo).toContainText('Greece');
    await expect(countryInfo).toContainText('Day 1');
    await expect(countryInfo).toContainText('9:00AM');
    
    // Check description is present
    const description = await activeDestination.locator('.description');
    await expect(description).toContainText('Begin your Mediterranean adventure');
  });

  test('should handle multiple destination clicks', async () => {
    // Click first destination
    const firstDest = await page.locator('.destination').first();
    await firstDest.click();
    await page.waitForTimeout(3500);
    
    // Click another destination
    const secondDest = await page.locator('.destination').nth(1);
    await secondDest.click();
    await page.waitForTimeout(3500);
    
    // Check if new popup appears
    const popup = await page.locator('.mapboxgl-popup').last();
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('Lunch at Mikro Cafe');
  });

  test('should have responsive sidebar', async () => {
    const sidebar = await page.locator('#sidebar');
    const sidebarWidth = await sidebar.evaluate(el => el.offsetWidth);
    
    // Sidebar should be 350px as defined in CSS
    expect(sidebarWidth).toBe(350);
  });

  test('should load Three.js and Threebox libraries', async () => {
    const hasThree = await page.evaluate(() => typeof THREE !== 'undefined');
    const hasThreebox = await page.evaluate(() => typeof Threebox !== 'undefined');
    
    expect(hasThree).toBeTruthy();
    expect(hasThreebox).toBeTruthy();
  });
});

test.describe('Map Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    const filePath = path.join(__dirname, 'balkans-3d-map.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for map to load
    await page.waitForSelector('.mapboxgl-map');
    
    // Tab through destinations
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // First destination should be focused (approximately)
    const focusedElement = await page.evaluate(() => document.activeElement.className);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    const filePath = path.join(__dirname, 'balkans-3d-map.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for map to be interactive
    await page.waitForFunction(() => {
      const map = window.map || document.querySelector('.mapboxgl-map')?._mapboxgl;
      return map && map.loaded();
    }, { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });
});