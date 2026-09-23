import { describe, expect, it } from "vitest";
import { defaultRedirect, safeRedirect } from "./redirect";

describe("safeRedirect", () => {
  it.each(["/dashboard", "/settings?tab=security", "/a/b#c"])(
    "keeps the relative path %s",
    (path) => {
      expect(safeRedirect(path)).toBe(path);
    },
  );

  it.each([
    undefined,
    ["/settings"],
    "",
    "dashboard",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
  ])("falls back to the default for %j", (value) => {
    expect(safeRedirect(value)).toBe(defaultRedirect);
  });
});
