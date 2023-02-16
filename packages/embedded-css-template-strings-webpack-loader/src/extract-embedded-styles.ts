import type webpack from "webpack";

const STYLES_REGEXP = /(const (.*?) = )?css`((.|\s)*?)`/;

export default function extractEmbeddedStylesLoader(
  this: webpack.LoaderContext<Record<string, never>>,
  source: string
) {
  // TODO: This assumes a single css`` template string has been included in the
  // page, and will produce inaccurate/surprising results if not
  const match = STYLES_REGEXP.exec(source);
  if (!match) {
    this.emitWarning(
      new Error(
        "cssup: extractEmbeddedStylesLoader called without an embedded template string value"
      )
    );
    return "";
  }
  return match[3];
}
