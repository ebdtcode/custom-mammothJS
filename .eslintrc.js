module.exports = {
    "env": {
        "node": true,
        "es6": true,
        "es2020": true
    },
    "parserOptions": {
        "ecmaVersion": 2020,
        "sourceType": "module"
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-const-assign": "error",
        "arrow-body-style": ["error", "as-needed"],
        "prefer-arrow-callback": "error",
        // Disable the rule causing the deprecation warning if needed
        "no-restricted-syntax": "off"
    },
    // Update parser settings
    "parser": "@babel/eslint-parser"
}