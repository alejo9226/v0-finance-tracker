import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig(
    [
        {
            files: ["**/*.{js,jsx,ts,tsx}"],
            ignores: ["node_modules", ".next", "dist"],
            languageOptions: {
                parserOptions: {
                    ecmaVersion: 2022,
                    sourceType: 'module',
                    project: './tsconfig.json',
                },
            },
            rules: {
                // Add rules here if you want to override
                '@typescript-eslint/no-explicit-any': 'warn',
            },
            extends: compat.extends(
                "next/core-web-vitals", 
                "next/typescript", 
                "next", 
                "prettier"
            ),
        }
    ]
);