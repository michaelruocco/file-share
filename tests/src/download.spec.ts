import { test, expect } from '@playwright/test';
import { textFilePath, createUploadUrl, createDownloadUrl, doDownload, readAndUploadFile, } from './fixtures';
import { readFileSync } from 'fs';

test('basic download', async () => {
  const contentType = 'text/plain';
  const filePath = textFilePath();
  const createUploadUrlResponse = await createUploadUrl(filePath, contentType);
  const createUploadUrlBody = await createUploadUrlResponse.json();
  const uploadResponse = await readAndUploadFile(createUploadUrlBody.uploadUrl, contentType, filePath);
  expect(uploadResponse.ok).toBeTruthy();

  const createDownloadUrlResponse = await createDownloadUrl(createUploadUrlBody.key, contentType);
  expect(createDownloadUrlResponse.ok()).toBeTruthy();

  const createDownloadUrlBody = await createDownloadUrlResponse.json();
  const downloadResponse = await doDownload(createDownloadUrlBody.downloadUrl);
  expect(downloadResponse.ok).toBeTruthy();

  const original = readFileSync(filePath, 'utf-8');
  const downloadedText = await downloadResponse.text();
  expect(downloadedText).toBe(original);
});