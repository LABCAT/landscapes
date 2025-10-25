// @ts-check
import { defineConfig } from 'astro/config';
import inject from '@rollup/plugin-inject';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    },

    imageService: "cloudflare"
  }),
  vite: {
    plugins: [
      inject({
        p5: ['p5', 'default'],
      }),
    ],
    resolve: {
      alias: {
        '@sketches': '/src/sketches',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
        '@lib': '/src/lib',
        '@templates': '/src/templates',
        '@components': '/src/components',
        '@pages': '/src/pages',
        '@': '/src',
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/mixins/breakpoints.scss";`
        }
      }
    }
  },
});