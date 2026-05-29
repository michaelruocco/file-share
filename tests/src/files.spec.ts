import { test, expect, APIResponse } from '@playwright/test';
import { textFilePath, createUploadUrl, readAndUploadFile, createApiContext } from './fixtures';

type FileSummary = {
  key: string;
  size: number;
  lastModified: string | undefined;
};

test('list files', async () => {
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

export async function getFiles(): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.get('/files');
  } finally {
    api.dispose();
  }
}
