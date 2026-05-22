import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, bucket, toObjectKey, toContentType } from "./s3";

export async function createUploadUrl(body: any) {
  const key = toObjectKey(body);
  const contentType = toContentType(body);
  const command = toPutObjectCommand(key, contentType);
  const options = { expiresIn: 60 * 5, };

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