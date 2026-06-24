import { _Object, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3, bucket } from '../../s3';

type GetFilesParams = {
  limit: number;
  cursor?: string | undefined;
  prefix?: string | undefined;
};

type FileSummary = {
  key: string;
  size: number;
  lastModified: string | undefined;
};

type GetFilesResponse = {
  files: FileSummary[];
  nextCursor?: string | undefined;
};

export async function getFilesHandler(params: GetFilesParams): Promise<GetFilesResponse> {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    MaxKeys: params.limit,
    ContinuationToken: params.cursor,
    Prefix: params.prefix
  });
  const response = await s3.send(command);
  const files: FileSummary[] = (response.Contents ?? [])
    .filter((object) => object.Key)
    .map((object) => toFileSummary(object));
  return {
    files: files,
    nextCursor: response.NextContinuationToken
  };
}

function toFileSummary(object: _Object): FileSummary {
  return {
    key: object.Key!,
    size: object.Size ?? 0,
    lastModified: object.LastModified?.toISOString()
  };
}
