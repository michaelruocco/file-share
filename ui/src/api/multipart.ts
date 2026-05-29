import { API_BASE_URL } from '../config';
import pLimit from 'p-limit';

const CHUNK_SIZE_MB = 20;
const CONCURRENCY = 5;

type UploadedPart = {
  number: number;
  etag: string;
};

export type UploadProgress = {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  elapsedSeconds: number;
  bytesPerSecond: number;
  remainingBytes: number;
  remainingSeconds: number;
};

const emptyProgress = {
  uploadedBytes: 0,
  totalBytes: 0,
  percentage: 0,
  elapsedSeconds: 0,
  bytesPerSecond: 0,
  remainingBytes: 0,
  remainingSeconds: 0
};

export async function multipartUpload(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ key: string }> {
  onProgress?.(emptyProgress);
  const contentType = file.type || 'application/octet-stream';
  const createResponse = await createMultipartUpload(file.name, contentType);
  const chunks = toChunks(file, CHUNK_SIZE_MB);

  let uploadedBytes = 0;
  const startedAt = Date.now();
  const limit = pLimit(CONCURRENCY);
  const uploadPromises = chunks.map((chunk, index) => {
    const number = index + 1;

    return limit(async () => {
      console.debug(`uploading part ${number}`);
      const result = await uploadPart(
        createResponse.uploadId,
        createResponse.key,
        number,
        chunk,
        contentType
      );

      uploadedBytes += chunk.size;
      const totalBytes = file.size;
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      const bytesPerSecond = uploadedBytes / elapsedSeconds;
      const remainingBytes = totalBytes - uploadedBytes;
      onProgress?.({
        uploadedBytes,
        totalBytes: file.size,
        percentage: (uploadedBytes / totalBytes) * 100,
        elapsedSeconds: elapsedSeconds,
        bytesPerSecond: bytesPerSecond,
        remainingBytes: remainingBytes,
        remainingSeconds: remainingBytes / bytesPerSecond
      });

      return result;
    });
  });

  const uploadedParts = await Promise.all(uploadPromises);

  await completeMultipartUpload(createResponse.uploadId, createResponse.key, uploadedParts);

  return {
    key: createResponse.key
  };
}

async function uploadPart(
  uploadId: string,
  key: string,
  number: number,
  chunk: Blob,
  contentType: string
): Promise<UploadedPart> {
  const partUrlResponse = await createPartUploadUrl(uploadId, key, number);

  const uploadResponse = await fetch(partUrlResponse.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType
    },
    body: chunk
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload part ${number}`);
  }

  const etag = uploadResponse.headers.get('etag');

  if (!etag) {
    throw new Error(`Missing ETag for part ${number}`);
  }

  return {
    number: number,
    etag
  };
}

async function createMultipartUpload(filename: string, contentType: string) {
  console.log(`${API_BASE_URL}/multipart-uploads`);
  const response = await fetch(`${API_BASE_URL}/multipart-uploads`, {
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
    throw new Error('Failed to create multipart upload');
  }

  return response.json();
}

async function createPartUploadUrl(uploadId: string, key: string, number: number) {
  const response = await fetch(`${API_BASE_URL}/multipart-uploads/${uploadId}/part-urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key,
      number
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create part upload URL');
  }

  return response.json();
}

async function completeMultipartUpload(
  uploadId: string,
  key: string,
  parts: {
    number: number;
    etag: string;
  }[]
) {
  const response = await fetch(`${API_BASE_URL}/multipart-uploads/${uploadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key,
      parts
    })
  });

  if (!response.ok) {
    throw new Error('Failed to complete multipart upload');
  }

  return response.json();
}

function toChunks(file: File, chunkSizeMb: number): Blob[] {
  const chunkSizeBytes = chunkSizeMb * 1024 * 1024;
  const chunks: Blob[] = [];

  for (let offset = 0; offset < file.size; offset += chunkSizeBytes) {
    const chunk = file.slice(offset, offset + chunkSizeBytes);
    chunks.push(chunk);
  }

  console.debug(`split file ${file} into ${chunks.length} chunks using size ${chunkSizeMb}mb`);
  return chunks;
}
