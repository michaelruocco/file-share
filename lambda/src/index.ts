import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
} from 'aws-lambda';
import { uploadHandler } from './upload';
import { downloadHandler } from './download';
import { getFilesHandler } from './files';
import { createMultipartUploadUrlHandler } from './multipart/start';
import { createMultipartUploadPartUrlHandler } from './multipart/part';
import { completeMultipartUploadHandler } from './multipart/complete';
import { route, matchRoute } from './router/router';

const routes = [
  route('POST', '/upload-urls', uploadHandler),

  route('POST', '/download-urls', downloadHandler),

  route('POST', '/multipart-uploads', createMultipartUploadUrlHandler),

  route('POST', '/multipart-uploads/:uploadId/part-urls', createMultipartUploadPartUrlHandler),

  route('POST', '/multipart-uploads/:uploadId', completeMultipartUploadHandler),

  route('GET', '/files', getFilesHandler)
];

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    console.log(`recieved event ${JSON.stringify(event)}`);
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;

    const matchedRoute = matchRoute(method, path, routes);

    if (!matchedRoute) {
      return notFound();
    }

    const response = await matchedRoute.handler(event, matchedRoute.params);

    return toSuccessResponse(response);
  } catch (err: unknown) {
    return handleError(err);
  }
};

function notFound(): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'not found' })
  };
}

function toSuccessResponse(result: unknown): APIGatewayProxyStructuredResultV2 {
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
