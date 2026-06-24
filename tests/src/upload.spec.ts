import { test, expect } from '@playwright/test';
import {
  generatePrefix,
  createUploadUrl,
  textFilePath,
  readAndUploadFile,
  deleteAllFiles
} from './fixtures';

test.afterEach(async ({}, testInfo) => {
  const prefix = generatePrefix(testInfo);
  await deleteAllFiles(prefix);
});

test('basic upload', async ({}, testInfo) => {
  const filePath = textFilePath();
  const contentType = 'text/plain';
  const prefix = generatePrefix(testInfo);
  const createUrlResponse = await createUploadUrl(filePath, contentType, prefix);
  expect(createUrlResponse.ok()).toBeTruthy();

  const createUrlBody = await createUrlResponse.json();
  const uploadResponse = await readAndUploadFile(createUrlBody.uploadUrl, contentType, filePath);
  expect(uploadResponse.ok).toBeTruthy();
});
