/** @type {import("lint-staged").Configuration} */
export default {
  "*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}": [
    "oxlint --fix --deny-warnings --no-error-on-unmatched-pattern",
    "biome check --write --no-errors-on-unmatched",
  ],
  "*.{json,jsonc,css,md}": "biome check --write --no-errors-on-unmatched",
};
