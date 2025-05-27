export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        '**/tests/**',
        '**/node_modules/**',
        'vitest.config.js',
        'index.js', // ← entrypoint
        'src/db/init.js', // ← bootstrap
      ],
    },
  },
};
