import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { s3, bucket, toObjectKey } from '../s3';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { toBody } from '../common';

type CreateMultipartPartUploadRequest = {
  filename: string;
  contentType: string;
};

type CreateMultipartPartUploadResponse = {
  uploadId: string | undefined;
  key: string;
};

export async function createMultipartUploadUrlHandler(
  event: APIGatewayProxyEventV2,
  _params: Record<string, string>
): Promise<CreateMultipartPartUploadResponse> {
  const body = toBody<CreateMultipartPartUploadRequest>(event);
  const key = toObjectKey(body.filename);
  const command = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    ContentType: body.contentType
  });

  const response = await s3.send(command);

  return { uploadId: response.UploadId, key };
}
