module.exports = {
  root: true,
  extends: ["cssup"],
  env: {
    browser: true,
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  overrides: [
    {
      files: ["src/**/*"],
      extends: ["plugin:@typescript-eslint/recommended-requiring-type-checking"],
    },
    {
      files: ["test/**/*"],
      parserOptions: { project: null },
    },
  ],
};
