import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'react/no-danger': 'error',
      'react/jsx-no-literals': [
        'error',
        {
          allowedStrings: ['·', '—', '/', '|', ':', '*'],
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['src/components/ui/**', '**/*.test.{ts,tsx}', 'tests/**'],
    rules: { 'react/jsx-no-literals': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
