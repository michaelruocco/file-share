import { APIGatewayProxyEventV2 } from 'aws-lambda';

export type RouteHandler = (event: APIGatewayProxyEventV2) => Promise<unknown>;

export type RouteDefinition = {
  method: string;
  path: string;
  handler: RouteHandler;
};
