import { S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export const bucket = process.env.BUCKET_NAME!;

const awsRegion = process.env.AWS_REGION;
if (!awsRegion) {
  throw new Error('AWS_REGION is not set');
}
export const s3 = new S3Client({ region: awsRegion });

export function toObjectKey(rawFilename: string): string {
  const filename = rawFilename.split(/[\\/]/).pop();
  return `uploads/${randomUUID()}/${filename}`;
}
