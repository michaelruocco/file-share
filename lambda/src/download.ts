import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.BUCKET_NAME!;

export async function createDownloadUrl(body: any) {
  const key = body.key;

  if (!key) {
    throw new Error("Missing key");
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5,
  });

  return { downloadUrl };
}