import { request, APIRequestContext, APIResponse } from '@playwright/test';
import { readFileSync } from 'fs';
import * as path from 'path';

export function textFilePath(): string {
  return path.resolve(__dirname, '..', 'files', 'text-file.txt');
}

export async function createUploadUrl(filename: string, contentType: string): Promise<APIResponse> {
    const api = await createApiContext();
    try {
      return await api.post('/upload-urls', {
        data: {
          filename,
          contentType,
        }
      });
    } finally {
      api.dispose()
    }
}

export async function createDownloadUrl(key: string, contentType: string): Promise<APIResponse> {
    const api = await createApiContext();
    console.log(`download key ${key}`);
    try {
      return await api.post('/download-urls', {
        data: {
          key,
          contentType,
        }
      });
    } finally {
      api.dispose();
    }
}

export async function createApiContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: process.env.API_BASE_URL ?? 'https://sj7l9w57m1.execute-api.eu-west-2.amazonaws.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  });
}

export async function doUpload(uploadUrl: string, contentType: string, filePath: string): Promise<Response> {
  const fileBuffer = readFileSync(filePath);
  return await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType
    },
    body: fileBuffer
  });
}

export async function doDownload(downloadUrl: string): Promise<Response> {
  return await fetch(downloadUrl, {
    method: 'GET',
  });
}