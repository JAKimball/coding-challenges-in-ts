import js from '@eslint/js'
import markdown from '@eslint/markdown'
import vitest from '@vitest/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import jsonc from 'eslint-plugin-jsonc'
import n from 'eslint-plugin-n'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import perfectionist from 'eslint-plugin-perfectionist'
import regexp from 'eslint-plugin-regexp'
import yml from 'eslint-plugin-yml'
import globals from 'globals'
import jsoncParser from 'jsonc-eslint-parser'
import tseslint from 'typescript-eslint'
import yamlParser from 'yaml-eslint-parser'

export default defineConfig([
  globalIgnores(['coverage*/**', 'lib/**', 'pnpm-lock.yaml']),

  // Scoped to code file extensions so these core/JS rules don't also run against
  // markdown's virtual source (whose SourceCode implementation can't support them).
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    extends: [
      js.configs.recommended,
      n.configs['flat/recommended'],
      perfectionist.configs['recommended-natural'],
      regexp.configs['flat/recommended'],
      prettier,
    ],
  },
  markdown.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.node },
    plugins: {
      import: importPlugin,
      'no-only-tests': noOnlyTests,
    },
    rules: {
      // These off/less-strict-by-default rules work well for this repo and we like them on.
      'import/extensions': ['error', 'ignorePackages'],
      'no-only-tests/no-only-tests': 'error',

      // These on-by-default rules don't work well for this repo and we like them off.
      'n/no-missing-import': 'off',
      'no-case-declarations': 'off',
      'no-constant-condition': 'off',
      'no-inner-declarations': 'off',

      // Stylistic concerns that don't interfere with Prettier.
      'perfectionist/sort-classes': [
        'error',
        {
          groups: [
            'index-signature',
            'static-property',
            'private-property',
            'property',
            'constructor',
            'static-method',
            'private-method',
            'method',
          ],
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          order: 'asc',
          partitionByComment: true,
          type: 'natural',
        },
      ],
    },
  },

  {
    files: ['**/*.ts'],
    extends: [
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      jsdoc.configs['flat/recommended-typescript-error'],
    ],
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'all' }],
      'jsdoc/informative-docs': 'error',
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-property': 'off',
      'jsdoc/require-returns': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.md/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    },
    rules: {
      // typescript-eslint's own no-deprecated (above) supersedes eslint-plugin-deprecation.
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    extends: [vitest.configs.recommended],
    rules: {
      // These on-by-default rules aren't useful in test files.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },

  {
    files: ['*.json', '*.jsonc'],
    ignores: ['package.json'],
    extends: [jsonc.configs['flat/recommended-with-json']],
    languageOptions: { parser: jsoncParser },
    rules: {
      'jsonc/sort-keys': 'error',
    },
  },
  {
    files: ['*.jsonc'],
    rules: { 'jsonc/no-comments': 'off' },
  },

  {
    files: ['**/*.{yml,yaml}'],
    extends: [yml.configs['flat/standard'], yml.configs['flat/prettier']],
    languageOptions: { parser: yamlParser },
    rules: {
      'yml/file-extension': ['error', { extension: 'yml' }],
      'yml/sort-keys': ['error', { order: { type: 'asc' }, pathPattern: '^.*$' }],
      'yml/sort-sequence-values': ['error', { order: { type: 'asc' }, pathPattern: '^.*$' }],
    },
  },
])
