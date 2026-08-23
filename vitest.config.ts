import { defineConfig } from 'vite-plus'

export default defineConfig({
  define: {
    'import.meta.vitest': false,
  },
  test: {
    benchmark: {
      includeSource: ['src/**/*.{js,ts}'],
    },
    clearMocks: true,
    coverage: {
      exclude: ['lib'],
      include: ['src/**/*.ts', 'src/**/*.js'],
      provider: 'istanbul',
      // The suite has known pre-existing kata failures; without this, no
      // coverage report is generated at all when tests fail.
      reportOnFailure: true,
      reporter: ['html', 'lcov'],
    },
    exclude: ['lib', 'node_modules'],
    includeSource: ['src/**/*.{js,ts}'],
    setupFiles: ['console-fail-test/setup'],
  },
})
