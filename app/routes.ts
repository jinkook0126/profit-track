import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('api/pdf-parsing', 'routes/api/pdf-parsing.ts'),
] satisfies RouteConfig;
