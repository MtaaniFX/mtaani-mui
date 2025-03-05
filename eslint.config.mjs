import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
// import pluginNext from "@next/eslint-plugin-next";


export default [
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    },
    {languageOptions: { globals: globals.browser }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    // pluginReact.configs.flat.recommended,
    pluginReact.configs.flat["jsx-runtime"],
    // This ESLint: Config (unnamed): Key "plugins": still uses the deprecated eslintrc format (array of strings)
    // rather than flat config format (object), needs update when the upstream `Next.js` update their configuration
    // pluginNext.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-empty-object-type': 'warn',
            'no-async-promise-executor': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            'prefer-const': 'warn',
            'no-extra-boolean-cast': 'warn',
            // '': 'warn',
        }
    }
];