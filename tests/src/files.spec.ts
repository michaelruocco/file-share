import { test, expect } from '@playwright/test';
import {
  textFilePath,
  createUploadUrl,
  readAndUploadFile,
  getFiles
} from './fixtures';
import type { FileSummary } from './fixtures';

test('get files', async () => {
  const contentType = 'text/plain';
  const filePath = textFilePath();
  const createUploadUrlResponse = await createUploadUrl(filePath, contentType);
  const createUploadUrlBody = await createUploadUrlResponse.json();
  const uploadResponse = await readAndUploadFile(
    createUploadUrlBody.uploadUrl,
    contentType,
    filePath
  );
  expect(uploadResponse.ok).toBeTruthy();

  const filesResponse = await getFiles();

  expect(filesResponse.ok()).toBeTruthy();
  const files = (await filesResponse.json()) as FileSummary[];
  expect(files.length).toBeGreaterThan(0);

  const uploadedFile = files.find((file: FileSummary) => file.key === createUploadUrlBody.key);
  expect(uploadedFile).toBeDefined();
  expect(uploadedFile?.size).toBe(17);
});
