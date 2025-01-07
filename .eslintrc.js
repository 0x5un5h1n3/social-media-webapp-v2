module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Disable specific warnings
    "@typescript-eslint/no-unused-vars": "off", // Disable unused vars check
    "react/no-unescaped-entities": "off", // Disable unescaped entities
    "@next/next/no-img-element": "off", // Disable img element warning
    "@typescript-eslint/no-require-imports": "off", // Disable unused imports warning
    "@next/next/no-img-element": "off", // Disable img element warning

    // Add more specific rule configurations
    "no-unused-vars": "off", // General unused vars check
    "react-hooks/exhaustive-deps": "warn",
  },
  // Add parser options
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
};
