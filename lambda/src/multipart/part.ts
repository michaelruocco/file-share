import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, bucket } from '../s3';

export type CreateMultipartPartUrlRequest = {
  key: string;
  number: number;
};

type CreateMultipartPartUrlResponse = {
  uploadUrl: string;
};

export async function createMultipartUploadPartUrlHandler(
  body: CreateMultipartPartUrlRequest,
  uploadId: string,
): Promise<CreateMultipartPartUrlResponse> {
  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: body.key,
    UploadId: uploadId,
    PartNumber: body.number
  });
  const options = { expiresIn: 60 * 5 };

  const uploadUrl = await getSignedUrl(s3, command, options);

  return { uploadUrl };
}
