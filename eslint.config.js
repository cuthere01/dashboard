module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    rules: {
        semi: "warn",
        "@typescript-eslint/no-empty-interface": [
            "error",
            {
                allowSingleExtends: true,
            },
        ],
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
};
