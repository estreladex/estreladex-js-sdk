import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import sortExports from 'eslint-plugin-sort-exports';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/node_modules/', '**/coverage/', 'src/services/models/']),
  {
    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'prettier',
      ),
    ),

    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      'sort-exports': sortExports,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.commonjs,
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'commonjs',

      parserOptions: {
        project: './tsconfig.lint.json',
      },
    },

    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },

    rules: {
      'sort-exports/sort-exports': [
        'error',
        {
          sortDir: 'asc',
          ignoreCase: true,
          sortExportKindFirst: 'none',
        },
      ],

      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-extraneous-dependencies': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-unused-modules': 'error',
      complexity: ['error', 20],
      eqeqeq: ['error', 'smart'],
    },
  },
]);
