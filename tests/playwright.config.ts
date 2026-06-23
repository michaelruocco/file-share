import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalTeardown: './src/global-teardown'
});
