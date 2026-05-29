import { test, expect } from '@playwright/test';
import { createUploadUrl, textFilePath, readAndUploadFile } from './fixtures';

test('basic upload', async () => {
  const filePath = textFilePath();
  const contentType = 'text/plain';
  const createUrlResponse = await createUploadUrl(filePath, contentType);
  expect(createUrlResponse.ok()).toBeTruthy();

  const createUrlBody = await createUrlResponse.json();
  const uploadResponse = await readAndUploadFile(createUrlBody.uploadUrl, contentType, filePath);
  expect(uploadResponse.ok).toBeTruthy();
});
