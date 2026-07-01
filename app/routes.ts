import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/index.tsx'),
  route('api/pdf-parsing', 'routes/api/pdf-parsing.ts'),
] satisfies RouteConfig;
