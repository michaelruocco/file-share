import { API_BASE_URL } from '../config';
import { multipartUpload } from './multipart';
import type { UploadProgress } from './multipart';

export type FileSummary = {
  key: string;
  size: number;
  lastModified?: string;
};

export async function getFiles(): Promise<FileSummary[]> {
  const response = await fetch(`${API_BASE_URL}/files`);

  if (!response.ok) {
    throw new Error('Failed to list files');
  }

  return await response.json();
}

const MULTIPART_UPLOAD_THRESHOLD = 10 * 1024 * 1024;

export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ key: string }> {
  if (file.size >= MULTIPART_UPLOAD_THRESHOLD) {
    return multipartUpload(file, onProgress);
  }
  return singleUpload(file);
}

async function singleUpload(file: File): Promise<{ key: string }> {
  const contentType = file.type || 'application/octet-stream';
  const uploadData = await createUploadUrl(file.name, contentType);
  await uploadToSignedUrl(uploadData.uploadUrl, file, contentType);
  return {
    key: uploadData.key
  };
}

async function createUploadUrl(filename: string, contentType: string) {
  const response = await fetch(`${API_BASE_URL}/upload-urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filename,
      contentType
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }

  return response.json();
}

async function uploadToSignedUrl(uploadUrl: string, file: Blob, contentType: string) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType
    },
    body: file
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }
}

export async function downloadFile(key: string): Promise<void> {
  const body = await createDownloadUrl(key);
  window.open(body.downloadUrl, '_blank');
}

export async function createDownloadUrl(key: string) {
  const response = await fetch(`${API_BASE_URL}/download-urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key })
  });

  if (!response.ok) {
    throw new Error('Failed to generate download URL');
  }

  return response.json();
}
