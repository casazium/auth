export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        '**/tests/**',
        '**/*.test.js',
        '**/__mocks__/**',
        '**/node_modules/**',
        'vitest.config.js',
        'index.js', // ← entrypoint
        'src/db/init.js', // ← bootstrap
      ],
    },
    setupFiles: ['./tests/setup.js'],
  },
};
