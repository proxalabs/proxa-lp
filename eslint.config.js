import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // The marketing copy is written as plain text in JSX; apostrophes are fine.
      'react/no-unescaped-entities': 'off',
      // The content manifest files export plain objects by design.
      'import/no-anonymous-default-export': 'off',
      // Existing images are sized by CSS; next/image is used where it is a clear win.
      '@next/next/no-img-element': 'off',
    },
  },
  {
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  globalIgnores([
    '.next/**',
    'dist/**',
    'next-env.d.ts',
    'functions/**',
    'media/**',
    'files/**',
    'src/payload-types.ts',
    'src/migrations/**',
    'src/app/(payload)/**',
  ]),
])
