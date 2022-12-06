const STYLES_REGEXP = /const (.*?) = css`((.|\s)*?)`/

module.exports = function (source) {
  const match = STYLES_REGEXP.exec(source)
  return match[2]
}
