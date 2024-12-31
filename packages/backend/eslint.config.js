import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],  // This replaces the --ext flag
    languageOptions: {
      ecmaVersion: 2020,
    },
  },
) 