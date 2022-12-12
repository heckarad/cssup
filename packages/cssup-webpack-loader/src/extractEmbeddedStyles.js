const STYLES_REGEXP = /const (.*?) = css`((.|\s)*?)`/;

module.exports = function (source) {
  // TODO: This assumes a single css`` template string has been included in the
  // page, and will produce inaccurate/surprising results if not
  const match = STYLES_REGEXP.exec(source);
  return match[2];
};
