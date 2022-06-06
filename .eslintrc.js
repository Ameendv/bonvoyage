module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["airbnb-base","prettier/prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "single"],
  },
};
