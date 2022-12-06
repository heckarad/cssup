/**
 * @fileoverview Edit this file to test the language service plugin programatic
 * language features.
 */

const extra = css`
  div {
    display: block;
  }
`

/** Example styles */
const styles = css`
  a {
    background-color: honeydew;
    display: inline-block;
  }

  .container {
    display: block;
  }

  .header {
    color: theme('colors.lime.500');

    .child {
      display: inline;
      color: var(--custom-value);
    }
  }
`

const className = styles.container

type ClassNames = {
  __css: 'true'
  [className: string]: string
}

function css(tmpl: TemplateStringsArray): ClassNames {
  return { __css: 'true' }
}

const obj = {
  notClassName: 7,
}

const nested = obj.notClassName
