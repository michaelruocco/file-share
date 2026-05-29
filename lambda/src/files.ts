import { _Object, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3, bucket } from './s3';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

type FileSummary = {
  key: string;
  size: number;
  lastModified: string | undefined;
};

export async function getFilesHandler(
  _event: APIGatewayProxyEventV2,
  _params: Record<string, string>
): Promise<FileSummary[]> {
  const command = new ListObjectsV2Command({ Bucket: bucket });
  const response = await s3.send(command);
  const files: FileSummary[] = (response.Contents ?? [])
    .filter((object) => object.Key)
    .map((object) => toFileSummary(object));
  return files;
}

function toFileSummary(object: _Object): FileSummary {
  return {
    key: object.Key!,
    size: object.Size ?? 0,
    lastModified: object.LastModified?.toISOString()
  };
}
