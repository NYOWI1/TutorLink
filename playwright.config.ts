import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  use: {
    viewport: { width: 1440, height: 1050 },
    baseURL: process.env.TEST_ORIGIN || 'http://localhost:3000',
    headless: true,
    launchOptions: {
      executablePath:
        process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
    trace: 'retain-on-failure',
  },
  reporter: 'list',
});
