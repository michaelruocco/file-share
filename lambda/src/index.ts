import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { createUploadUrl } from "./upload";
import { createDownloadUrl } from "./download";
import { createMultipartUploadUrl } from "./multipart/start";

type Handler = (body: any) => Promise<any>;

const routes: Record<string, Handler> = {
  "POST /upload-urls": createUploadHandler,
  "POST /download-urls": createDownloadHandler,
  "POST /multipart-uploads": createMultipartUploadHandler,
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log(`recieved event ${JSON.stringify(event)}`);
    const body = event.body ? JSON.parse(event.body) : {};

    const routeKey = `${event.requestContext.http.method} ${event.requestContext.http.path}`;
    const handler = routes[routeKey];
    console.log(`found handler ${handler} using route key ${routeKey}`);

    if (!handler) {
      return notFound();
    }

    return await handler(body);
  } catch (err: any) {
    return handleError(err);
  }
};

async function createUploadHandler(body: any) {
  const result = await createUploadUrl(body);
  return toSuccessResponse(result);
}

async function createDownloadHandler(body: any) {
  const result = await createDownloadUrl(body);
  return toSuccessResponse(result);
}

async function createMultipartUploadHandler(body: any) {
  const result = await createMultipartUploadUrl(body);
  return toSuccessResponse(result);
}

function toSuccessResponse(result: any) {
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}

function notFound() {
  return {
    statusCode: 404,
    body: JSON.stringify({ message: "not found" }),
  };
}

function handleError(err: any) {
  console.error(err);
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: err?.message || "server error",
    }),
  };
}