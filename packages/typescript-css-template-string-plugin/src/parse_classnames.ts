import postcss from 'postcss'

/**
 * parseClassNamesFromSourceFileText extracts the CSS class names from a source
 * file text, assuming they're defined in a css`` template string.
 */
export function parseClassNamesFromSourceFileText(text: string): string[] {
  const classNames: string[] = []

  // hmmm: there could be more than one match which makes groups unusable..
  const templateContents = text.match(/css`((.|\s)+?)`/gm)
  if (templateContents) {
    // Get the contents of each match and postcss them, add the whole group to suggestions for now
    const stylesheets = templateContents.map((styles) => styles.slice(0, -1).slice(4))

    stylesheets.forEach((styles) => {
      const ast = postcss.parse(styles)

      ast.nodes.forEach((astNode) => {
        if (astNode.type === 'rule') {
          const classes = astNode.selector.match(/\.\w+/g)
          if (classes) {
            classNames.push(...classes.map((className) => className.slice(1)))
          }
        }
      })
    })
  }

  return classNames
}
