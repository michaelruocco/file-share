import { request, APIRequestContext, APIResponse, TestInfo } from '@playwright/test';
import { readFileSync } from 'fs';
import * as path from 'path';

export function generatePrefix(testInfo: TestInfo): string {
  return `playwright/${testInfo.testId}`;
}

export function textFilePath(): string {
  return path.resolve(__dirname, '..', 'files', 'test-file.txt');
}

export function largeBinaryFilePath(): string {
  return path.resolve(__dirname, '..', 'files', 'test-multipart.bin');
}

export async function createUploadUrl(
  filename: string,
  contentType: string,
  prefix?: string
): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.post('/upload-urls', {
      data: {
        prefix,
        filename,
        contentType
      }
    });
  } finally {
    api.dispose();
  }
}

export async function createDownloadUrl(key: string, contentType: string): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.post('/download-urls', {
      data: {
        key,
        contentType
      }
    });
  } finally {
    api.dispose();
  }
}

export async function createApiContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: process.env.API_BASE_URL || 'https://t08qceavmb.execute-api.eu-west-2.amazonaws.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  });
}

export async function readAndUploadFile(
  uploadUrl: string,
  contentType: string,
  filePath: string
): Promise<Response> {
  const fileBuffer = readFileSync(filePath);
  return doUpload(uploadUrl, contentType, fileBuffer);
}

export async function doUpload(
  uploadUrl: string,
  contentType: string,
  body: Buffer
): Promise<Response> {
  return await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType
    },
    body: new Uint8Array(body)
  });
}

export async function doDownload(downloadUrl: string): Promise<Response> {
  return await fetch(downloadUrl, {
    method: 'GET'
  });
}

export async function getFiles(prefix?: string): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.get('/files', {
      data: {
        prefix
      }
    });
  } finally {
    api.dispose();
  }
}

type GetPaginatedFilesParams = {
  limit: number;
  cursor?: string;
  prefix?: string;
};

export async function getPaginatedFiles(params: GetPaginatedFilesParams): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.get('files', {
      params
    });
  } finally {
    api.dispose();
  }
}

export async function deleteAllFiles(prefix?: string): Promise<APIResponse> {
  const api = await createApiContext();
  try {
    return await api.delete('/files', {
      data: {
        prefix
      }
    });
  } finally {
    api.dispose();
  }
}

export type FileSummary = {
  key: string;
  size: number;
  lastModified: string | undefined;
};
