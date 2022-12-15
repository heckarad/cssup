export type ClassNames = {
  __css: "true";
  [className: string]: string;
};

export function css(tmpl: TemplateStringsArray): ClassNames {
  return { __css: "true" };
}
