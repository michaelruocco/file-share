import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { s3, bucket } from '../s3';
import { pathToUploadId, toBody } from '../common';

type CreateMultipartPartUrlRequest = {
  key: string;
  number: number;
};

type CreateMultipartPartUrlResponse = {
  uploadUrl: string;
};

export async function createMultipartUploadPartUrlHandler(
  event: APIGatewayProxyEventV2,
  _params: Record<string, string>
): Promise<CreateMultipartPartUrlResponse> {
  const body = toBody<CreateMultipartPartUrlRequest>(event);
  const uploadId = pathToUploadId(event.requestContext.http.path);
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
