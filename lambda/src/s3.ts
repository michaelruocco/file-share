import { S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export const bucket = process.env.BUCKET_NAME!;

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export function toObjectKey(rawFilename: string): string {
  const filename = rawFilename.split(/[\\/]/).pop();
  return `uploads/${randomUUID()}/${filename}`;
};