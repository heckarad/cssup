import postcss, { ChildNode } from 'postcss'

/**
 * parseClassNamesFromSourceFileText extracts the CSS class names from a source
 * file text, assuming they're defined in a css`` template string.
 */
export function parseClassNamesFromSourceFileText(text: string): string[] {
  const classNames: string[] = []

  // Match all template string definitions - plugin isn't smart enough to return
  // correct classes if a file has multiple
  const cssTemplateStrings = text.match(/css`((.|\s)+?)`/gm)
  if (!cssTemplateStrings) return classNames

  // For each template string definition strip off leading css` and trailing `
  const stylesheets = cssTemplateStrings.map((styles) => styles.slice(0, -1).slice(4))

  stylesheets.forEach((styles) => {
    const ast = postcss.parse(styles)
    ast.nodes.forEach((astNode) => walkNodes(astNode, classNames))
  })

  return classNames
}

/**
 * Recursive function walks the PostCSS AST and compiles the set of defined classes
 */
function walkNodes(astNode: ChildNode, classNames: string[]) {
  // BREAK CASE
  if (astNode.type === 'decl') return

  if (astNode.type === 'rule') {
    const classes = astNode.selector.match(/\.\w+/g)
    if (classes) {
      classNames.push(...classes.map((className) => className.slice(1)))
    }
  }

  // RECURSE
  if ('nodes' in astNode) {
    astNode.nodes.forEach((childNode) => walkNodes(childNode, classNames))
  }
}
