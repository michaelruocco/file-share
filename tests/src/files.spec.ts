import { test, expect } from '@playwright/test';
import {
  textFilePath,
  createUploadUrl,
  readAndUploadFile,
  getFiles,
  getPaginatedFiles
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
  const filesResponseBody = await filesResponse.json();
  const files = filesResponseBody.files as FileSummary[];
  expect(files.length).toBeGreaterThan(0);

  const uploadedFile = files.find((file: FileSummary) => file.key === createUploadUrlBody.key);
  expect(uploadedFile).toBeDefined();
  expect(uploadedFile?.size).toBe(17);
});

test('get paginated files', async () => {
  const uploadedKeys = [];
  for (let i = 0; i < 2; i++) {
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
    uploadedKeys.push(createUploadUrlBody.key);
  }

  const firstFilesResponse = await getPaginatedFiles(1);
  const firstFilesResponseBody = await firstFilesResponse.json();
  const firstFiles = (firstFilesResponseBody.files as FileSummary[]) || [];
  expect
    .poll(
      async () => {
        return firstFiles.length;
      },
      { timeout: 1000 }
    )
    .toBe(1);
  const firstFileKey = firstFiles[0]!.key;

  const cursor = firstFilesResponseBody.nextCursor;
  const nextFilesResponse = await getPaginatedFiles(1, cursor);
  const nextFilesResponseBody = await nextFilesResponse.json();
  const nextFiles = (nextFilesResponseBody.files as FileSummary[]) || [];
  expect(nextFiles.length).toBe(1);
  const nextFileKey = nextFiles[0]!.key;
  expect(nextFilesResponseBody.cursor).toBeUndefined();
  expect(firstFileKey).not.toEqual(nextFileKey);
});
