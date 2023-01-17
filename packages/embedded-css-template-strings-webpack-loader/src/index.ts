import type webpack from "webpack";

const extractEmbeddedStylesLoader = require.resolve("./extract-embedded-styles");

const LIBRARY_REGEXP = /from ('|")cssup('|")/;
const STYLES_REGEXP = /const (.*?) = css`((.|\s)*?)`/;

/**
 * Loader that converts embedded css template strings to css module imports.
 * @example
 * Input:
 * ```js
 * const styles = css`
 *   .header { color: hotpink; }
 * `
 * ```
 *
 * Output:
 * ```js
 * import styles from "./filename.module.css!=!.path/to/loader/getStyles.js!./filename.js"
 * ```
 */
export default function cssupWebpackLoader(
  this: webpack.LoaderContext<Record<string, never>>,
  source: string
) {
  // Quick check: is there a css`` template string in this module
  // TODO: configurable template string tag
  const embeddedStylesMatch = STYLES_REGEXP.exec(source);
  if (!embeddedStylesMatch) return source;

  // Quick check: is there an import from the embedded template string library
  // TODO: configurable library import
  const libraryMatch = LIBRARY_REGEXP.exec(source);
  if (!libraryMatch) return source;

  // Remove the embedded styles from the original source before passing
  // content to next loader
  const processedSource = source.replace(STYLES_REGEXP, "");

  // Use the "inline match resource" syntax to create a new request to the
  // extractEmbeddedStylesLoader
  // ref: https://webpack.js.org/api/loaders/#inline-matchresource
  return `import ${embeddedStylesMatch[1]} from ${JSON.stringify(
    this.utils.contextify(
      this.context || this.rootContext,
      `${this.resource}.module.css!=!${extractEmbeddedStylesLoader}!${this.remainingRequest}`
    )
  )};${processedSource}`;
}
