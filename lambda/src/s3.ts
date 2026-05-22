import { S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export const bucket = process.env.BUCKET_NAME!;

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export function toObjectKey(body: any): string {
  const rawFilename = body.filename ?? "upload.bin";
  const filename = rawFilename.split(/[\\/]/).pop();
  return `uploads/${randomUUID()}/${filename}`;
}

export function toContentType(body: any): string {
   return body.contentType ?? "application/octet-stream"; 
}