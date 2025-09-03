import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/**/src/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@sam/db': resolve(__dirname, 'packages/db/src/index.ts'),
      '@sam/emails': resolve(__dirname, 'packages/emails/src/index.ts')
    }
  }
});