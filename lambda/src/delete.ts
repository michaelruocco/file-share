import { DeleteObjectCommand, ListObjectsV2Command, ListObjectsV2CommandOutput, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3, bucket } from './s3';
import { APIGatewayProxyEventV2 } from 'aws-lambda';



export async function deleteFilesHandler(
  event: APIGatewayProxyEventV2,
  _params: Record<string, string>
): Promise<void> {
  const key = event.queryStringParameters?.key;

  if (key) {
    await deleteFile(key);
    return;
  }
  
  await deleteAllFiles();
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

async function deleteAllFiles() {
  let deleted = 0;
  let continuationToken: string | undefined = undefined;

  do {
    const response: ListObjectsV2CommandOutput = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken
      })
    );

    const contents = response.Contents ?? [];
    const objects = contents
      .map(object => object.Key)
      .filter( (key): key is string => key !== undefined )
      .map(key => ({ Key: key }));

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

    continuationToken =
      response.NextContinuationToken;
  } while (continuationToken);

  return deleted;
}

