/*
This ESLint config is a teeny bit more complex than what I show in my talk...

I added two plugins that auto-sort keys in JS/TS files:
	* eslint-plugin-simple-import-sort
	* eslint-plugin-typescript-sort-keys

I added eslint-plugin-jsonc to auto-sort keys in .json files

I use the react/jsx-runtime config instead of react/recommended.
See https://github.com/jsx-eslint/eslint-plugin-react#configuration-legacy-eslintrc.

I only enabled typescript-eslint's rules in .ts and .tsx files (see the 'overrides') array.
This way they don't apply to .js files, like this .eslintrc.cjs.
*/

/* eslint-env commonjs, node */
module.exports = {
  extends: ["eslint:recommended", "plugin:typescript-sort-keys/recommended"],
  overrides: [
    {
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      files: ["**/*.{ts,tsx}"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
    },
    {
      files: "*.json",
      parser: "jsonc-eslint-parser",
      rules: {
        "jsonc/sort-keys": "error",
      },
      extends: ["plugin:jsonc/recommended-with-json"],
    },
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "simple-import-sort", "typescript-sort-keys"],
  root: true,
  rules: {
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
  },
};
