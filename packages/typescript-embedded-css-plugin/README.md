# TypeScript language service Plugin - Embedded CSS

TS language service plugin that provides programatic language features within CSS template
strings.

## Features

- [x] CSS Autocomplete

## TODO

- [ ] Configurable template string tags, eg "styles"

## Development

The `/test` directory contains an example setup to develop against.

**Start the compiler in watch mode for the plugin**

```sh
npm run watch --workspace=typescript-embedded-css-plugin
```

**Open the test directory**

Oen the `/test` directory and install the dependencies. Then to develop against the
workspace plugin instance you must be using the workspace version of TypeScript. Open the
`test/example.ts` file, then run the _TypeScript: Select TypeScript Version_ command and
select _"Use workspace version"_

You should now be able to edit the CSS in the template string and see autocomplete
suggestions.

## Attribution

This package is only possible thanks to the following packages:

- [TypeScript Styled Plugin](https://github.com/microsoft/typescript-styled-plugin)
- [TypeScript TSServer Plugin Template](https://github.com/orta/TypeScript-TSServer-Plugin-Template)

## Reference

- [Writing a Language Service Plugin](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#overview-writing-a-simple-plugin)
