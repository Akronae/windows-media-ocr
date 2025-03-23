import viteTsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      exclude: ['.yarn', '*.config.js', '*.config.ts', 'dist'],
    },
    globalSetup: ['./vitest.setup.ts'],
  },
  plugins: [viteTsconfigPaths()],
});
