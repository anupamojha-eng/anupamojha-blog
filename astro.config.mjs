// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// output: 'static' — all pages static except /api/* endpoints (server-rendered via Cloudflare Workers)
export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
});
