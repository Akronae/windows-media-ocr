import eslint from '@eslint/js';
import eslintprettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // keep ignores here inside its own object
  // https://github.com/eslint/eslint/discussions/18304#discussioncomment-9069706
  {
    ignores: [
      '.git/*',
      '.idea/*',
      '.yarn/*',
      'node_modules/*',
      'coverage/*',
      'dist/*',
      '.prisma/*',
      'prisma/*',
    ],
  },
  eslint.configs.recommended,
  eslintprettier,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  }
);
