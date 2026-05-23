import {
  RouteDefinition,
  RouteHandler,
  RouteParams,
} from "./types";

export function route(
  method: string,
  path: string,
  handler: RouteHandler
): RouteDefinition {
  return {
    method,
    path,
    handler,
  };
}

export function matchRoute(
  method: string,
  path: string,
  routes: RouteDefinition[]
) {
  for (const route of routes) {
    const matched = matchRouteDefinition(
      method,
      path,
      route
    );

    if (matched) {
      return matched;
    }
  }

  return null;
}

function matchRouteDefinition(
  method: string,
  path: string,
  route: RouteDefinition
) {
  if (route.method !== method) {
    return null;
  }

  const routeSegments = toSegments(route.path);
  const pathSegments = toSegments(path);

  if (
    !hasMatchingSegmentCount(
      routeSegments,
      pathSegments
    )
  ) {
    return null;
  }

  if (
    !segmentsMatch(
      routeSegments,
      pathSegments
    )
  ) {
    return null;
  }

  return {
    handler: route.handler,
    params: toParams(
      routeSegments,
      pathSegments
    ),
  };
}

function toSegments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function hasMatchingSegmentCount(
  routeSegments: string[],
  pathSegments: string[]
): boolean {
  return (
    routeSegments.length ===
    pathSegments.length
  );
}

function segmentsMatch(
  routeSegments: string[],
  pathSegments: string[]
): boolean {
  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const pathSegment = pathSegments[i];

    if (isRouteParameter(routeSegment)) {
      continue;
    }

    if (routeSegment !== pathSegment) {
      return false;
    }
  }

  return true;
}

function toParams(
  routeSegments: string[],
  pathSegments: string[]
): RouteParams {
  const params: RouteParams = {};

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];

    if (!isRouteParameter(routeSegment)) {
      continue;
    }

    params[toParamName(routeSegment)] =
      pathSegments[i];
  }

  return params;
}

function isRouteParameter(
  segment: string
): boolean {
  return segment.startsWith(":");
}

function toParamName(segment: string): string {
  return segment.slice(1);
}