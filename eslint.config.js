import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "supabase", "src/app/lib/database.types.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "vite.config.ts"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Remaining intentional exceptions carry an inline disable comment
      // explaining why; anything new fails the build.
      "react-hooks/set-state-in-effect": "error",
      "react-hooks/static-components": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
);
