import { describe, expect, it, vi } from "vitest";
import { roleFor } from "./admin-role";

vi.mock("@/env", () => ({ env: { ADMIN_EMAILS: ["admin@example.com"] } }));
vi.mock("./prisma", () => ({ prisma: {} }));

describe("roleFor", () => {
  it("makes verified listed users admins", () => {
    expect(roleFor({ email: "Admin@Example.com", emailVerified: true })).toBe(
      "admin",
    );
  });

  it("ignores listed users whose email isn't verified", () => {
    expect(roleFor({ email: "admin@example.com", emailVerified: false })).toBe(
      "user",
    );
  });

  it("makes everyone else a user", () => {
    expect(roleFor({ email: "other@example.com", emailVerified: true })).toBe(
      "user",
    );
  });
});
