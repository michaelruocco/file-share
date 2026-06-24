import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
} from 'aws-lambda';
import { route, matchRoute } from './router/router';
import { uploadHandler, CreateUploadUrlRequest } from './handlers/upload';
import { downloadHandler, CreateDownloadUrlRequest } from './handlers/download';
import { getFilesHandler } from './handlers/file/get';
import { deleteFilesHandler } from './handlers/file/delete';
import {
  createMultipartUploadUrlHandler,
  CreateMultipartPartUploadRequest
} from './handlers/multipart/start';
import {
  createMultipartUploadPartUrlHandler,
  CreateMultipartPartUrlRequest
} from './handlers/multipart/part';
import {
  completeMultipartUploadHandler,
  CompleteMultipartUploadRequest
} from './handlers/multipart/complete';

const routes = [
  route('GET', '/health', async () => ({
    status: 'ok'
  })),

  route('POST', '/upload-urls', async (event: APIGatewayProxyEventV2) => {
    const body = toBody<CreateUploadUrlRequest>(event);
    return uploadHandler(body);
  }),

  route('POST', '/download-urls', async (event: APIGatewayProxyEventV2) => {
    const body = toBody<CreateDownloadUrlRequest>(event);
    return downloadHandler(body);
  }),

  route('POST', '/multipart-uploads', async (event: APIGatewayProxyEventV2) => {
    const body = toBody<CreateMultipartPartUploadRequest>(event);
    return createMultipartUploadUrlHandler(body);
  }),

  route('POST', '/multipart-uploads/:uploadId/part-urls', async (event: APIGatewayProxyEventV2) => {
    const body = toBody<CreateMultipartPartUrlRequest>(event);
    const uploadId = toUploadId(event);
    return createMultipartUploadPartUrlHandler(body, uploadId);
  }),

  route('POST', '/multipart-uploads/:uploadId', async (event: APIGatewayProxyEventV2) => {
    const body = toBody<CompleteMultipartUploadRequest>(event);
    const uploadId = toUploadId(event);
    return completeMultipartUploadHandler(body, uploadId);
  }),

  route('GET', '/files', async (event: APIGatewayProxyEventV2) => {
    const params = {
      limit: Number(event.queryStringParameters?.limit ?? 20),
      cursor: event.queryStringParameters?.cursor,
      prefix: event.queryStringParameters?.prefix
    };
    return getFilesHandler(params);
  }),

  route('DELETE', '/files', async (event: APIGatewayProxyEventV2) => {
    const params = {
      key: event.queryStringParameters?.key,
      prefix: event.queryStringParameters?.prefix
    };
    return deleteFilesHandler(params);
  })
];

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    console.log(`recieved event ${JSON.stringify(event)}`);
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;
    const handler = matchRoute(method, path, routes);
    if (!handler) {
      return notFound();
    }
    const response = await handler(event);
    return toSuccessResponse(response);
  } catch (err: unknown) {
    return handleError(err);
  }
};

function toBody<T>(event: APIGatewayProxyEventV2): T {
  if (!event.body) {
    throw new Error('Missing event body');
  }

  const body = JSON.parse(event.body) as T;
  console.log(`parsed body ${JSON.stringify(body)}`);
  return body;
}

function toUploadId(event: APIGatewayProxyEventV2): string {
  const uploadId = event.pathParameters?.uploadId;

  if (!uploadId) {
    throw new Error('Missing upload id');
  }

  return uploadId;
}

function notFound(): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'not found' })
  };
}

function toSuccessResponse(result: unknown): APIGatewayProxyStructuredResultV2 {
  console.log(`returning success response ${JSON.stringify(result)}`);
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}

function handleError(err: unknown): APIGatewayProxyStructuredResultV2 {
  console.error(err);
  const message = err instanceof Error ? err.message : 'server error';
  return {
    statusCode: 500,
    body: JSON.stringify({ message })
  };
}
