import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'cypress.config.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
  {
    files: [
      'src/features/**/presentation/screens/**/*.{ts,tsx}',
      'src/features/auth/data/local/funcionariosService.ts',
      'src/features/auth/data/local/usuariosService.ts',
      'src/features/solicitudes/data/local/solicitudesLocalService.ts',
      'src/core/presentation/components/ProtectedRoute.tsx',
    ],
    rules: {
      // Módulos heredados: se mantiene visible la deuda de hooks mientras
      // los modelos de dominio reemplazan gradualmente los tipos dinámicos.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
