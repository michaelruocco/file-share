import { test, expect, APIResponse } from '@playwright/test';
import { createApiContext } from './fixtures';
import type { FileSummary } from './fixtures';

test('get health', async () => {
  const response = await getHealth();

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.status).toBe('ok');
});

export async function getHealth(): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.get('/health');
  } finally {
    api.dispose();
  }
}
