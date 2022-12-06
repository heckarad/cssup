/**
 * @fileoverview Edit this file to test the extension syntax highlighting and
 * language service plugin programatic language features.
 */

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

const usage = styles

/** @returns {{ __css: 'true'; [className: string]: string }} */
function css(tmpl) {
  return { __css: 'true' }
}
