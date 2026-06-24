import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/playwright-report/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_'
        }
      ]
    },
    overrides: [
      {
        files: ['**/*.spec.ts'],
        rules: {
          'no-empty-pattern': 'off'
        }
      }
    ]
  }
];
