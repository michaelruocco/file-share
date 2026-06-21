import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, bucket, toObjectKey } from '../s3';

export type CreateUploadUrlRequest = {
  filename: string;
  contentType: string;
};

type CreateUploadUrlResponse = {
  uploadUrl: string;
  key: string;
};

export async function uploadHandler(
  body: CreateUploadUrlRequest
): Promise<CreateUploadUrlResponse> {
  const key = toObjectKey(body.filename);
  const command = toPutObjectCommand(key, body.contentType);
  const options = { expiresIn: 60 * 5 };

  const uploadUrl = await getSignedUrl(s3, command, options);

  return { uploadUrl, key };
}

function toPutObjectCommand(key: string, contentType: string): PutObjectCommand {
  return new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });
}
