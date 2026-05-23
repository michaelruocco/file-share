import { APIGatewayProxyEventV2 } from "aws-lambda";

export function toBody<T>(
  event: APIGatewayProxyEventV2
): T {
  if (!event.body) {
    throw new Error("Missing event body");
  }

  const body = JSON.parse(event.body) as T;
  console.log(`parsed body ${JSON.stringify(body)}`);
  return body;
}