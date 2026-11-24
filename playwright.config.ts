import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3012',
    browserName: 'chromium',
    channel: 'msedge',
    launchOptions: {args: ['--enable-unsafe-swiftshader']},
    screenshot: 'only-on-failure',
  },
  webServer: {command:'npm run start -- --port 3012',url:'http://127.0.0.1:3012',reuseExistingServer:true,timeout:60000},
});
