import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    // CLI のエントリポイントだけは標準出力への表示を許可する
    files: ['src/cli.ts'],
    rules: { 'no-console': 'off' }
  }
);
