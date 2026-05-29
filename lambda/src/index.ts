import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { uploadHandler } from './upload';
import { downloadHandler } from './download';
import { getFilesHandler } from './files';
import { createMultipartUploadUrlHandler } from './multipart/start';
import { createMultipartUploadPartUrlHandler } from './multipart/part';
import { completeMultipartUploadHandler } from './multipart/complete';
import { route, matchRoute } from './router/router';

type Handler = (event: APIGatewayProxyEventV2) => Promise<any>;

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
): Promise<any> => {
  try {
    console.log(`recieved event ${JSON.stringify(event)}`);
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;

    const route = matchRoute(method, path, routes);

    if (!route) {
      return notFound();
    }

    const response = await route.handler(event, route.params);

    return toSuccessResponse(response);
  } catch (err: any) {
    return handleError(err);
  }
};

function notFound(): any {
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'not found' })
  };
}

function toSuccessResponse(result: any): any {
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}

function handleError(err: any): any {
  console.error(err);
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: err?.message || 'server error'
    })
  };
}
