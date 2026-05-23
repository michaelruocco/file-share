import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { s3, bucket } from "../s3";
import { toBody } from "../common";

type CreateMultipartPartUrlRequest = {
  key: string;
  partNumber: number;
};

export async function createMultipartUploadPartUrlHandler(
    event: APIGatewayProxyEventV2,
    params: Record<string, string>): Promise<any> {
  const body = toBody<CreateMultipartPartUrlRequest>(event);
  const uploadId = toUploadId(event.requestContext.http.path);

  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: body.key,
    UploadId: uploadId,
    PartNumber: body.partNumber,
  });
  const options = { expiresIn: 60 * 5, };

  const uploadUrl = await getSignedUrl(s3, command, options);

  return { uploadUrl };
}

function toUploadId(path: string): string {
  return path.split("/")[2];
}