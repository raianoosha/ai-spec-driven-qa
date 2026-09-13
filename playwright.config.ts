import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './generated',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [
    ['list'],
    ['json', { outputFile: 'artifacts/playwright-results.json' }],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: process.env.SAUCEDEMO_BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
