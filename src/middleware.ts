import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (_context, _next) => {
  return new Response('Access denied', { status: 403 });
});
