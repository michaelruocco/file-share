import { test, expect } from '@playwright/test';
import {
  generatePrefix,
  deleteAllFiles,
  textFilePath,
  createUploadUrl,
  readAndUploadFile,
  getFiles,
  getPaginatedFiles
} from './fixtures';
import type { FileSummary } from './fixtures';

test.afterEach(async ({}, testInfo) => {
  const prefix = generatePrefix(testInfo);
  await deleteAllFiles(prefix);
});

test('get files', async ({}, testInfo) => {
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

  const filesResponse = await getFiles(prefix);

  expect(filesResponse.ok()).toBeTruthy();
  const filesResponseBody = await filesResponse.json();
  const files = filesResponseBody.files as FileSummary[];
  expect(files.length).toBeGreaterThan(0);

  const uploadedFile = files.find((file: FileSummary) => file.key === createUploadUrlBody.key);
  expect(uploadedFile).toBeDefined();
  expect(uploadedFile?.size).toBe(17);
});

test('get paginated files', async ({}, testInfo) => {
  const uploadedKeys: string[] = [];
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
  console.log(`uploaded keys ${JSON.stringify(uploadedKeys)}`);

  await eventuallyStableList(prefix, 2);

  const first = await eventuallyGetFiles({ limit: 1, prefix }, 1);
  console.log('got first');
  const firstFiles = first.files as FileSummary[];
  const firstFileKey = firstFiles[0]!.key;

  const cursor = first.body.nextCursor;
  console.log(`getting next with cursor ${cursor}`);
  const next = await eventuallyGetFiles({ limit: 1, cursor, prefix }, 1);
  console.log('got next');
  const nextFiles = next.files as FileSummary[];
  const nextFileKey = nextFiles[0]!.key;

  expect(next.body.nextCursor).toBeUndefined();
  console.log(`first ${firstFileKey}`);
  console.log(`next  ${nextFileKey}`);
  expect(firstFileKey).not.toEqual(nextFileKey);
});

async function eventuallyStableList(prefix: string, expectedCount: number) {
  await expect
    .poll(
      async () => {
        const r1 = await getPaginatedFiles({ limit: 10, prefix });
        const b1 = await r1.json();

        const r2 = await getPaginatedFiles({ limit: 10, prefix });
        const b2 = await r2.json();

        const k1 = (b1.files ?? []).map((f: FileSummary) => f.key).sort();
        const k2 = (b2.files ?? []).map((f: FileSummary) => f.key).sort();

        const same = JSON.stringify(k1) === JSON.stringify(k2);

        return same && k1.length === expectedCount;
      },
      {
        timeout: 30000,
        intervals: [200, 500, 1000]
      }
    )
    .toBe(true);
}

async function eventuallyGetFiles(
  params: { limit: number; cursor?: string; prefix?: string },
  expectedCount: number
) {
  let result: any;

  await expect
    .poll(
      async () => {
        const res = await getPaginatedFiles(params);
        const body = await res.json();

        const files = body.files ?? [];
        result = { body, files };

        return files.length === expectedCount;
      },
      {
        timeout: 20000
        //intervals: [200, 500, 1000]
      }
    )
    .toBe(true);

  return result;
}
