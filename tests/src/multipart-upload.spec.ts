import { test, expect, APIResponse } from '@playwright/test';
import {
  largeBinaryFilePath,
  createApiContext,
  doUpload,
  createDownloadUrl,
  doDownload
} from './fixtures';
import { readFileSync } from 'fs';

test('multipart upload', async () => {
  const filePath = largeBinaryFilePath();
  const contentType = 'application/octet-stream';
  const chunks = toChunks(filePath, 5);

  const createMultipartResponse = await createMultipartUpload(filePath, contentType);
  expect(createMultipartResponse.ok()).toBeTruthy();
  const createMultipartBody = await createMultipartResponse.json();

  const uploadedParts = await Promise.all(
    chunks.map(async (chunk, index) => {
      const number = index + 1;
      const createPartUrlResponse = await createMultipartPartUploadUrl(
        createMultipartBody.uploadId,
        createMultipartBody.key,
        number
      );

      expect(createPartUrlResponse.ok()).toBeTruthy();

      const createPartUrlResponseBody = await createPartUrlResponse.json();
      const partUploadResponse = await doUpload(
        createPartUrlResponseBody.uploadUrl,
        contentType,
        chunk
      );

      expect(partUploadResponse.ok).toBeTruthy();

      const part = {
        number,
        etag: partUploadResponse.headers.get('etag')!
      };
      console.log(`uploaded part ${JSON.stringify(part)}`);
      return part;
    })
  );

  console.log(`completing upload with ${uploadedParts.length} parts`);
  const completeMultipartResponse = await completeMultipartUpload(
    createMultipartBody.uploadId,
    createMultipartBody.key,
    uploadedParts
  );
  expect(completeMultipartResponse.ok()).toBeTruthy();

  const completeMultipartResponseBody = await completeMultipartResponse.json();
  const createDownloadUrlResponse = await createDownloadUrl(
    completeMultipartResponseBody.key,
    contentType
  );
  expect(createDownloadUrlResponse.ok()).toBeTruthy();

  const createDownloadUrlBody = await createDownloadUrlResponse.json();
  const downloadResponse = await doDownload(createDownloadUrlBody.downloadUrl);
  expect(downloadResponse.ok).toBeTruthy();

  const originalBuffer = readFileSync(filePath);
  const downloadArrayBuffer = await downloadResponse.arrayBuffer();
  const downloadedBuffer = Buffer.from(downloadArrayBuffer);
  expect(downloadedBuffer).toEqual(originalBuffer);
});

function toChunks(filePath: string, chunkSizeMb: number): Buffer[] {
  const fileBuffer = readFileSync(filePath);
  const chunkSizeBytes = chunkSizeMb * 1024 * 1024;
  const chunks: Buffer[] = [];

  for (let offset = 0; offset < fileBuffer.length; offset += chunkSizeBytes) {
    const chunk = fileBuffer.subarray(offset, offset + chunkSizeBytes);
    chunks.push(chunk);
  }

  console.log(`split file ${filePath} into ${chunks.length} chunks using size ${chunkSizeMb}mb`);
  return chunks;
}

export async function createMultipartUpload(
  filename: string,
  contentType: string
): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.post('/multipart-uploads', {
      data: {
        filename,
        contentType
      }
    });
  } finally {
    api.dispose();
  }
}

export async function createMultipartPartUploadUrl(
  uploadId: string,
  key: string,
  number: number
): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.post(`multipart-uploads/${uploadId}/part-urls`, {
      data: {
        key,
        number
      }
    });
  } finally {
    api.dispose();
  }
}

export type MultipartUploadRequestPart = {
  number: number;
  etag: string;
};

export async function completeMultipartUpload(
  uploadId: string,
  key: string,
  parts: MultipartUploadRequestPart[]
): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.post(`multipart-uploads/${uploadId}`, {
      data: {
        key,
        parts
      }
    });
  } finally {
    api.dispose();
  }
}
