module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['@makerx/eslint-config', 'plugin:react-hooks/recommended', 'plugin:tailwindcss/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
}
