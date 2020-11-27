module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "ignorePatterns": ["*.test.js", "*.css", "*.json", "*.svg"],
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["error", "single"],
        "react/prop-types": ["off", "always"],
    }
};
