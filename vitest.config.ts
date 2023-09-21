import { defineConfig } from 'vitest/config'

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
      all: true,
      exclude: ['lib'],
      include: ['src'],
      provider: 'istanbul',
      reporter: ['html', 'lcov'],
    },
    exclude: ['lib', 'node_modules'],
    includeSource: ['src/**/*.{js,ts}'],
    setupFiles: ['console-fail-test/setup'],
  },
})
