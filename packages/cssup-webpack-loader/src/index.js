const getStylesLoader = require.resolve('./getStyles')

const STYLES_REGEXP = /const (.*?) = css`((.|\s)*?)`/

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
module.exports = function (source) {
  const embeddedCSSMatch = STYLES_REGEXP.exec(source)

  if (embeddedCSSMatch) {
    const processedSource = source.replace(STYLES_REGEXP, '')

    return `import ${embeddedCSSMatch[1]} from ${JSON.stringify(
      this.utils.contextify(
        this.context || this.rootContext,
        `${this.resource}.module.css!=!${getStylesLoader}!${this.remainingRequest}`,
      ),
    )};${processedSource}`
  }

  return source
}
