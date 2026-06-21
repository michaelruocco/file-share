import { CompleteMultipartUploadCommand, CompletedPart } from '@aws-sdk/client-s3';
import { s3, bucket } from '../../s3';

export type CompleteMultipartUploadRequest = {
  key: string;
  parts: CompleteMultipartUploadRequestPart[];
};

type CompleteMultipartUploadRequestPart = {
  number: number;
  etag: string;
};

type CompleteMultipartUploadResponse = {
  key: string;
};

export async function completeMultipartUploadHandler(
  body: CompleteMultipartUploadRequest,
  uploadId: string
): Promise<CompleteMultipartUploadResponse> {
  validate(body);
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: body.key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: toCompletedParts(body.parts)
    }
  });

  await s3.send(command);

  return { key: body.key };
}

function validate(body: CompleteMultipartUploadRequest): void {
  if (!body.key) {
    throw new Error('Missing key');
  }
  if (!body.parts || body.parts.length === 0) {
    throw new Error('Missing parts');
  }
}

function toCompletedParts(parts: CompleteMultipartUploadRequestPart[]): CompletedPart[] {
  return parts
    .sort((a, b) => a.number - b.number)
    .map((part) => ({
      PartNumber: part.number,
      ETag: part.etag
    }));
}
