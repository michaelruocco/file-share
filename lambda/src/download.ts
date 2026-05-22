import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, bucket } from "./s3";

export async function createDownloadUrl(body: any) {
  const key = body.key;

  if (!key) {
    throw new Error("Missing key");
  }

  const command = toGetObjectCommand(key);

  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

  return { downloadUrl };
}

function toGetObjectCommand(key: string): GetObjectCommand {
  return new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
}