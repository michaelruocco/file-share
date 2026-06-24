import { test, expect, APIResponse } from '@playwright/test';
import {
  generatePrefix,
  textFilePath,
  createUploadUrl,
  readAndUploadFile,
  getFiles,
  createApiContext,
  deleteAllFiles
} from './fixtures';
import type { FileSummary } from './fixtures';

test.afterEach(async ({}, testInfo) => {
  const prefix = generatePrefix(testInfo);
  await deleteAllFiles(prefix);
});

test('delete single file', async ({}, testInfo) => {
  const contentType = 'text/plain';
  const filePath = textFilePath();
  const prefix = generatePrefix(testInfo);
  const createUploadUrlResponse = await createUploadUrl(filePath, contentType, prefix);
  const createUploadUrlBody = await createUploadUrlResponse.json();
  const uploadResponse = await readAndUploadFile(
    createUploadUrlBody.uploadUrl,
    contentType,
    filePath
  );
  expect(uploadResponse.ok).toBeTruthy();

  const fileSummaries = await getFilesSummaries();
  expect(fileSummaries.map((file) => file.key)).toContain(createUploadUrlBody.key);

  const deleteResponse = await deleteFile(createUploadUrlBody.key);
  expect(deleteResponse.ok).toBeTruthy();

  const updatedFileSummaries = await getFilesSummaries();
  expect(updatedFileSummaries.map((file) => file.key)).not.toContain(createUploadUrlBody.key);
});

test('delete multiple files', async ({}, testInfo) => {
  const uploadedKeys = [];
  const prefix = generatePrefix(testInfo);
  for (let i = 0; i < 2; i++) {
    const contentType = 'text/plain';
    const filePath = textFilePath();
    const createUploadUrlResponse = await createUploadUrl(filePath, contentType, prefix);
    const createUploadUrlBody = await createUploadUrlResponse.json();
    const uploadResponse = await readAndUploadFile(
      createUploadUrlBody.uploadUrl,
      contentType,
      filePath
    );
    expect(uploadResponse.ok).toBeTruthy();
    uploadedKeys.push(createUploadUrlBody.key);
  }

  const fileSummaries = await getFilesSummaries(prefix);
  expect(fileSummaries.map((file) => file.key)).toEqual(expect.arrayContaining(uploadedKeys));

  const deleteResponse = await deleteAllFiles(prefix);
  expect(deleteResponse.ok).toBeTruthy();

  const updatedFileSummaries = await getFilesSummaries(prefix);
  for (const uploadedKey of uploadedKeys) {
    expect(updatedFileSummaries.map((file) => file.key)).not.toContain(uploadedKey);
  }
});

export async function getFilesSummaries(prefix?: string): Promise<FileSummary[]> {
  const filesResponse = await getFiles(prefix);
  expect(filesResponse.ok()).toBeTruthy();
  const filesResponseBody = await filesResponse.json();
  return filesResponseBody.files as FileSummary[];
}

export async function deleteFile(key: string): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.delete(`/files?key=${key}`);
  } finally {
    api.dispose();
  }
}
