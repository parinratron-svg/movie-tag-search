import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "always" }]],
  use: {
    baseURL: process.env.TEST_URL || "http://localhost:3000",
    trace: "on-first-retry",
    headless: false,
    launchOptions: {
      slowMo: 600, // หน่วงเวลา 0.6 วินาทีต่อการกระทำ เพื่อให้ดูทัน
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
