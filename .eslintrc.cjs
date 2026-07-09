module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  settings: {
    react: {
      // All workspace packages pin react@^19.0.0; 'detect' can't resolve a
      // "react" package from the repo root since it's only a dependency of
      // apps/* and games/* packages, not the root.
      version: '19.0',
    },
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'react/prop-types': 'off',
    // Games are touch-first kiosk UIs; keyboard/physical-button input is handled by a
    // global keydown listener in each App.tsx, not per-element, so these rules don't apply.
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
  },
  ignorePatterns: ['dist', 'node_modules', 'storybook-static', '*.config.js', '*.config.ts'],
  overrides: [
    {
      files: ['scripts/**/*.js'],
      env: { node: true, es2020: true, browser: false },
      parserOptions: { sourceType: 'script' },
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
  ],
};
