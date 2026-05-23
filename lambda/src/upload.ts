import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, bucket, toObjectKey } from "./s3";
import { toBody } from "./common";
import { APIGatewayProxyEventV2 } from "aws-lambda";

type CreateUploadUrlRequest = {
  filename: string;
  contentType: string;
};

export async function uploadHandler(
    event: APIGatewayProxyEventV2,
    params: Record<string, string>): Promise<any> {
  const body = toBody<CreateUploadUrlRequest>(event);
  const key = toObjectKey(body.filename);
  const command = toPutObjectCommand(key, body.contentType);
  const options = { expiresIn: 60 * 5, };

  const uploadUrl = await getSignedUrl(s3, command, options);

  return { uploadUrl, key };
};

function toPutObjectCommand(key: string, contentType: string): PutObjectCommand {
  return new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });
};