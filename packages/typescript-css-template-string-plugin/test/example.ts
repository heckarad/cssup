/**
 * @fileoverview Edit this file to test the language service plugin programatic
 * language features.
 */

/** Example styles */
const styles = css`
  a {
    background-color: honeydew;
    display: inline-block;
  }

  .header {
    color: theme('colors.lime.500');

    .child {
      display: inline;
      color: var(--custom-value);
    }
  }
`

styles.

function css(tmpl: TemplateStringsArray): Record<string, string> & { __cssup: 'true' } {
  return { __cssup: 'true', header: 'header_aj93i3o' }
}
