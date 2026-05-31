import { test, expect, APIResponse } from '@playwright/test';
import {
  textFilePath,
  createUploadUrl,
  readAndUploadFile,
  getFiles,
  createApiContext
} from './fixtures';
import type { FileSummary } from './fixtures';

test('delete single file', async () => {
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

  const fileSummaries = await getFilesSummaries();
  expect(fileSummaries.map((file) => file.key)).toContain(createUploadUrlBody.key);

  const deleteResponse = await deleteFile(createUploadUrlBody.key);
  expect(deleteResponse.ok).toBeTruthy();

  const updatedFileSummaries = await getFilesSummaries();
  expect(updatedFileSummaries.map((file) => file.key)).not.toContain(createUploadUrlBody.key);
});

test('delete multiple files', async () => {
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

  const fileSummaries = await getFilesSummaries();
  expect(fileSummaries.map((file) => file.key)).toEqual(expect.arrayContaining(uploadedKeys));

  const deleteResponse = await deleteAllFiles();
  expect(deleteResponse.ok).toBeTruthy();

  const updatedFileSummaries = await getFilesSummaries();
  for (const uploadedKey of uploadedKeys) {
    expect(updatedFileSummaries.map((file) => file.key)).not.toContain(uploadedKey);
  }
});

export async function getFilesSummaries(): Promise<FileSummary[]> {
  const filesResponse = await getFiles();
  expect(filesResponse.ok()).toBeTruthy();
  return (await filesResponse.json()) as FileSummary[];
}

export async function deleteFile(key: string): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.delete(`/files?key=${key}`);
  } finally {
    api.dispose();
  }
}

export async function deleteAllFiles(): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.delete('/files');
  } finally {
    api.dispose();
  }
}
