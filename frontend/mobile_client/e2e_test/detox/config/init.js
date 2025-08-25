const detox = require('detox');
const config = require('../../../.detoxrc.js');

// Set up before all tests
beforeAll(async () => {
  await detox.init(config, { initGlobals: false });
  
  // Set mock auth environment
  if (device.getPlatform() === 'ios') {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        detoxPrintBusyIdleResources: 'YES',
        mockAuthEnabled: 'true',
      },
      permissions: {
        notifications: 'YES',
        photos: 'YES',
        camera: 'YES',
      },
    });
  } else {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        detoxPrintBusyIdleResources: 'YES',
        mockAuthEnabled: 'true',
      },
      permissions: {
        notifications: 'YES',
        photos: 'YES',
        camera: 'YES',
      },
    });
  }
});

// Clean up after all tests
afterAll(async () => {
  await detox.cleanup();
});

// Reset app state before each test
beforeEach(async () => {
  await device.reloadReactNative();
});

// Take screenshot on test failure
afterEach(async function () {
  if (this.currentTest && this.currentTest.state === 'failed') {
    const testName = this.currentTest.title.replace(/[^a-zA-Z0-9]/g, '_');
    await device.takeScreenshot(testName);
  }
});