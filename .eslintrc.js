module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Disable specific warnings
    "@typescript-eslint/no-unused-vars": "off", // or 'warn' if you prefer
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",

    // Add more specific rule configurations
    "no-unused-vars": "off",
    "react-hooks/exhaustive-deps": "warn",
  },
  // Add parser options
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
};
