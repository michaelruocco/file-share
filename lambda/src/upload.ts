import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.BUCKET_NAME!;

export async function createUploadUrl(body: any) {
  const key = toObjectKey(body);
  const contentType = toContentType(body);
  const command = toPutObjectCommand(key, contentType);
  const options = { expiresIn: 60 * 10, };

  const uploadUrl = await getSignedUrl(s3, command, options);

  return { uploadUrl, key };
}

function toObjectKey(body: any): string {
  const rawFilename = body.filename ?? "upload.bin";
  const filename = rawFilename.split(/[\\/]/).pop();
  return `uploads/${randomUUID()}/${filename}`;
}

function toContentType(body: any): string {
   return body.contentType ?? "application/octet-stream"; 
}

function toPutObjectCommand(key: string, contentType: string): PutObjectCommand {
  return new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType
  });
}