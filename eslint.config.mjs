import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'
import tailwind from 'eslint-plugin-tailwindcss'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ['dist/**'],
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        module: true,
      },
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        browser: true,
      },
    },
    plugins: {
      react,
      'react-refresh': reactRefresh,
      'react-hooks': reactHooks,
      tailwindcss: tailwind,
    },

    rules: {
      //   ...react.configs.recommended.rules,
      //   ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'no-console': 'warn',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      'tailwindcss/classnames-order': 'warn',
    },
    settings: { tailwindcss: { config: false } },
  },
  prettier
)
