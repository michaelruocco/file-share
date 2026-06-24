import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3';
import { s3, bucket } from '../../s3';

type DeleteParams = {
  key?: string | undefined;
  prefix?: string | undefined;
};
export async function deleteFilesHandler(params: DeleteParams): Promise<void> {
  if (params.key && params.prefix) {
    throw new Error('key and prefix cannot both be specified at the same time');
  }

  if (params.key) {
    await deleteFile(params.key);
    return;
  }

  await deleteAllFiles(params.prefix);
}

async function deleteFile(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );
  console.log(`deleted file ${key}`);
}

async function deleteAllFiles(prefix?: string) {
  let deleted = 0;
  let continuationToken: string | undefined = undefined;

  do {
    const response: ListObjectsV2CommandOutput = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        Prefix: prefix
      })
    );

    const contents = response.Contents ?? [];
    const objects = contents
      .map((object) => object.Key)
      .filter((key): key is string => key !== undefined)
      .map((key) => ({ Key: key }));

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects
          }
        })
      );

      deleted += objects.length;
      console.debug(`deleted ${objects.length} objects ${JSON.stringify(objects)}`);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return deleted;
}
