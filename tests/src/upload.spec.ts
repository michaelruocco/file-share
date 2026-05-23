import { test, expect, request } from '@playwright/test';
import { readFileSync } from 'fs';

test('basic upload', async () => {
  const api = await request.newContext({
    baseURL: 'https://ltc01ebmr1.execute-api.eu-west-2.amazonaws.com'
  });
  const contentType = 'text/plain';

  const createResponse = await api.post('/upload-urls', {
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      filename: 'text-file.txt',
      contentType: contentType,
    }
  });

  expect(createResponse.ok()).toBeTruthy();

  const createBody = await createResponse.json();
  const uploadUrl = createBody.uploadUrl;
  const fileBuffer = readFileSync(
    'text-file.txt'
  );

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType
    },
    body: fileBuffer
  });

  expect(uploadResponse.ok).toBeTruthy();
});