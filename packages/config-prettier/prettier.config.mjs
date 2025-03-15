export default {
  $schema: "https://json.schemastore.org/prettierrc",
  arrowParens: "always",
  bracketSpacing: false,
  printWidth: 150,
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
};
