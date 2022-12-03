# TypeScript language service Plugin - CSS template string

TS language service plugin that provides TS support for working with embedded CSS template
strings.

## Features

- [x] Suggest classes from same file

## TODO

- [ ] Configurable PostCSS plugins

## Developing

The `/test` directory contains an example setup to develop against.

**Start the compiler in watch mode for the plugin**

```sh
npm run watch --workspace=typescript-css-template-string-plugin
```

**Open the test directory**

Oen the `/test` directory and install the dependencies. Then to develop against the
workspace plugin instance you must be using the workspace version of TypeScript. Open the
`test/example.ts` file, then run the _TypeScript: Select TypeScript Version_ command and
select _"Use workspace version"_

You should now be able to edit the CSS in the template string and see autocomplete
suggestions.

## Reference

- [Writing a Language Service Plugin](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#overview-writing-a-simple-plugin)
