import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { s3, bucket, toObjectKey } from '../../s3';

export type CreateMultipartPartUploadRequest = {
  prefix?: string;
  filename: string;
  contentType: string;
};

type CreateMultipartPartUploadResponse = {
  uploadId: string | undefined;
  key: string;
};

export async function createMultipartUploadUrlHandler(
  body: CreateMultipartPartUploadRequest
): Promise<CreateMultipartPartUploadResponse> {
  const key = toObjectKey(body.filename, body.prefix);
  const command = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    ContentType: body.contentType
  });

  const response = await s3.send(command);

  return { uploadId: response.UploadId, key };
}
