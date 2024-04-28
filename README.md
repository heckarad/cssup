# CSSUp

<!-- Goal -->

_Tooling to support writing same file, compile time component styles as embedded CSS
template strings._

## Features

## Example

```ts

```

## Packages

- [cssup](./packages/cssup) - Client library with template string function import for
  application code.
- [embedded-css-template-strings-webpack-loader](./packages/embedded-css-template-strings-webpack-loader) -
  webpack loader for extracting embedded css template strings during application bundling.
- [typescript-css-template-string-plugin](./packages/typescript-css-template-string-plugin) -
  TS language server plugin that provides programmatic language support for working with
  cssup `css` template string return values, eg autocomplete for style names.
- [typescript-embedded-css-plugin](./packages/typescript-embedded-css-plugin) - TS
  language service plugin that that uses the
  `typescript-template-language-service-decorator` to provide CSS language support inside
  cssup CSS template strings.
- [vscode-embedded-css-template-strings](./packages/vscode-embedded-css-template-strings) -
  VSCode extension that provides syntax highlighting in CSS template strings along with
  auto-setup of the TS language server plugin.
