// @ts-check

import eslint from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import perfectionist from 'eslint-plugin-perfectionist'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { defineConfig, globalIgnores } from 'eslint/config'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      perfectionist,
    },
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/naming-convention': [
        'warn',
        { format: ['PascalCase'], selector: 'interface' },
        { format: ['PascalCase'], selector: ['accessor', 'typeLike'] },
        { format: ['UPPER_CASE'], selector: 'enumMember' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extraneous-class': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      '@typescript-eslint/no-useless-constructor': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-includes': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
      eqeqeq: ['error', 'always'],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-return-await': 'warn',
      'perfectionist/sort-imports': [
        'warn',
        {
          groups: ['type', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'side-effect'],
          newlinesBetween: 1,
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-objects': ['warn', { order: 'asc', type: 'alphabetical' }],
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    plugins: { vitest },
    rules: {
      'vitest/consistent-vitest-vi': ['error', { fn: 'vi' }],
      'vitest/no-alias-methods': 'warn',
      'vitest/no-import-node-test': 'error',
      'vitest/no-test-return-statement': 'error',
      'vitest/prefer-import-in-mock': 'warn',
    },
  },
  globalIgnores(['**/*.d.ts', '**/*.cjs', '**/*.js', '**/*.mjs', '**/tc/**/*']),
])
