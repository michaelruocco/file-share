import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3, bucket, toObjectKey, toContentType } from "../s3";

export async function createMultipartUploadUrl(body: any) {
  const key = toObjectKey(body.filename);
  const contentType = toContentType(body);
  const command = toCreateMultipartUploadCommand(key, contentType);

  const response = await s3.send(command);

  return { uploadId: response.UploadId, key };
}

function toCreateMultipartUploadCommand(key: string, contentType: string): CreateMultipartUploadCommand {
  return new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });
}