import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Load-bearing architectural constraint (technical-approach.md §5):
  // src/composition/ must remain free of React so composition state stays
  // portable, JSON-serializable, and extractable to a Model C document
  // renderer later.
  {
    files: ['src/composition/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message:
                'src/composition/ must be React-free. Composition state is pure data — see docs/planning/technical-approach.md §5.',
            },
            {
              group: ['**/canvas/**'],
              message:
                'src/composition/ must not depend on the canvas renderer.',
            },
          ],
        },
      ],
    },
  },
])
