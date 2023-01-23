# CSSUp

_Tooling to support writing same file, compile time component styles as embedded CSS
template strings._

## Project packages

- [cssup](./packages/cssup) - Client library with template string function import for
  application code.
- [embedded-css-template-strings-webpack-loader](./packages/embedded-css-template-strings-webpack-loader) -
  webpack loader for extracting embedded css template strings during application bundling.
- [typescript-css-template-string-plugin](./packages/typescript-css-template-string-plugin) -
  TS language server plugin that provides autocomplete for generated class names objects.
- [typescript-embedded-css-plugin](./packages/typescript-embedded-css-plugin) - TS
  language server plugin that provides language support inside CSS template strings.
- [vscode-embedded-css-template-strings](./packages/vscode-embedded-css-template-strings) -
  VSCode extension that provides syntax highlighting in CSS template strings along with
  auto-setup of the TS language server plugin.
