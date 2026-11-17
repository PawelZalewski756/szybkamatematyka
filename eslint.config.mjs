import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Reguły a11y włączone świadomie i punktowo.
 *
 * `eslint-config-next` rejestruje plugin `jsx-a11y`, ale nie włącza jego reguł.
 * Pełny zestaw "recommended" dawał ~209 ostrzeżeń, w większości fałszywych
 * (np. `label-has-for`, `prefer-tag-over-role` na poprawnych wzorcach), więc
 * bramka byłaby bezużyteczna. Poniżej są reguły o realnym wpływie na obsługę
 * klawiaturą i czytniki ekranu.
 *
 * Świadomie NIE włączamy `jsx-a11y/no-autofocus`: w modalu onboardingu
 * i w formularzu pojedynków autofocus przenosi fokus do dialogu, co jest
 * zalecanym zachowaniem WAI-ARIA, a nie błędem.
 */
const a11yRules = {
  "jsx-a11y/alt-text": "error",
  "jsx-a11y/anchor-has-content": "error",
  "jsx-a11y/anchor-is-valid": "error",
  "jsx-a11y/aria-props": "error",
  "jsx-a11y/aria-proptypes": "error",
  "jsx-a11y/aria-role": "error",
  "jsx-a11y/aria-unsupported-elements": "error",
  "jsx-a11y/heading-has-content": "error",
  "jsx-a11y/label-has-associated-control": "error",
  "jsx-a11y/no-redundant-roles": "error",
  "jsx-a11y/role-has-required-aria-props": "error",
  "jsx-a11y/role-supports-aria-props": "error",
  // Ostrzeżenia: elementy klikalne bez obsługi klawiatury.
  "jsx-a11y/click-events-have-key-events": "warn",
  "jsx-a11y/no-static-element-interactions": "warn",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: a11yRules,
  },
  // Plain CommonJS Node scripts legitimately use require().
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
