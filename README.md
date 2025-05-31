# 3D Interactive Balkans Map - Testing Guide

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

### Run specific test file
```bash
npx playwright test balkans-map.spec.js
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Coverage

The test suite covers:

1. **Page Loading**
   - Correct title
   - All required elements present

2. **Sidebar Functionality**
   - Display of all 10 destinations
   - Hover effects
   - Click interactions

3. **Map Features**
   - Map initialization
   - Navigation controls
   - Fullscreen control
   - 3D terrain
   - Markers

4. **Interactions**
   - Flying to destinations on click
   - Popup displays
   - Multiple destination navigation

5. **Performance**
   - Load time testing
   - Library loading verification

6. **Accessibility**
   - Basic keyboard navigation

## Notes

- Tests use file:// protocol to load the HTML file directly
- Some tests have timeouts to account for map animations
- The web server configuration in playwright.config.js allows for HTTP testing if needed