const { test, expect } = require('@playwright/test');
const path = require('path');

test('Debug - Check console errors', async ({ page }) => {
  // Capture console messages
  const messages = [];
  page.on('console', msg => {
    messages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Capture errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.toString());
  });

  const filePath = path.join(__dirname, 'balkans-3d-map.html');
  await page.goto(`file://${filePath}`);
  
  // Wait a bit for everything to load
  await page.waitForTimeout(3000);
  
  // Print console messages
  console.log('\nConsole messages:');
  messages.forEach(msg => {
    console.log(`${msg.type}: ${msg.text}`);
  });
  
  // Print errors
  console.log('\nPage errors:');
  errors.forEach(err => {
    console.log(err);
  });
  
  // Check if destinations exist in DOM
  const destinationCount = await page.evaluate(() => {
    return document.querySelectorAll('.destination').length;
  });
  
  console.log(`\nDestinations found: ${destinationCount}`);
  
  // Check if createDestinationList function exists
  const functionExists = await page.evaluate(() => {
    return typeof createDestinationList !== 'undefined';
  });
  
  console.log(`createDestinationList exists: ${functionExists}`);
  
  // Try to manually call the function
  if (functionExists) {
    await page.evaluate(() => {
      if (typeof createDestinationList === 'function') {
        createDestinationList();
      }
    });
    
    await page.waitForTimeout(500);
    
    const newCount = await page.evaluate(() => {
      return document.querySelectorAll('.destination').length;
    });
    
    console.log(`Destinations after manual call: ${newCount}`);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  // Expect at least the page to load
  await expect(page).toHaveTitle('3D Interactive Balkans Map');
});