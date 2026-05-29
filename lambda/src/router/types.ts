import { APIGatewayProxyEventV2 } from 'aws-lambda';

export type RouteParams = Record<string, string>;

export type RouteHandler = (event: APIGatewayProxyEventV2, params: RouteParams) => Promise<unknown>;

export type RouteDefinition = {
  method: string;
  path: string;
  handler: RouteHandler;
};
