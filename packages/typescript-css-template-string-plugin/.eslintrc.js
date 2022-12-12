module.exports = {
  root: true,
  extends: ["cssup"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
};
