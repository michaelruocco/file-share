import { RouteDefinition, RouteHandler } from './types';

export function route(method: string, path: string, handler: RouteHandler): RouteDefinition {
  return {
    method,
    path,
    handler
  };
}

export function matchRoute(
  method: string,
  path: string,
  routes: RouteDefinition[]
): RouteHandler | null {
  for (const route of routes) {
    if (routeMatches(method, path, route)) {
      return route.handler;
    }
  }
  return null;
}

function routeMatches(method: string, path: string, route: RouteDefinition): boolean {
  if (route.method !== method) {
    return false;
  }
  const routeSegments = toSegments(route.path);
  const pathSegments = toSegments(path);
  if (!hasMatchingSegmentCount(routeSegments, pathSegments)) {
    return false;
  }

  return segmentsMatch(routeSegments, pathSegments);
}

function toSegments(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function hasMatchingSegmentCount(routeSegments: string[], pathSegments: string[]): boolean {
  return routeSegments.length === pathSegments.length;
}

function segmentsMatch(routeSegments: string[], pathSegments: string[]): boolean {
  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i]!;
    const pathSegment = pathSegments[i]!;
    if (!isRouteParameter(routeSegment) && routeSegment !== pathSegment) {
      return false;
    }
  }

  return true;
}

function isRouteParameter(segment: string): boolean {
  return segment.startsWith(':');
}
