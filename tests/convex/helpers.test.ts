import { beforeEach, describe, expect, test } from "bun:test";
import { getUser, requireUser } from "../../convex/helpers";

function mockCtx(identity: unknown) {
  return {
    auth: {
      getUserIdentity: async () => identity,
    },
  } as never;
}

beforeEach(() => {
  delete process.env.INTERNAL_ALLOWED_EMAILS;
  delete process.env.INTERNAL_ALLOWED_DOMAINS;
});

describe("getUser", () => {
  test("returns null when getUserIdentity returns null", async () => {
    process.env.INTERNAL_ALLOWED_EMAILS = "me@example.com";
    await expect(getUser(mockCtx(null))).resolves.toBeNull();
  });

  test("returns user when email is explicitly allowed", async () => {
    process.env.INTERNAL_ALLOWED_EMAILS = "me@example.com";
    await expect(getUser(mockCtx({ tokenIdentifier: "user|1", email: "me@example.com", name: "Me" }))).resolves.toEqual({
      id: "user|1",
      email: "me@example.com",
      name: "Me",
    });
  });

  test("returns user when domain is allowed", async () => {
    process.env.INTERNAL_ALLOWED_DOMAINS = "example.com";
    await expect(getUser(mockCtx({ tokenIdentifier: "user|2", email: "a@example.com" }))).resolves.toEqual({
      id: "user|2",
      email: "a@example.com",
      name: undefined,
    });
  });

  test("returns null when user email is not in allowlist", async () => {
    process.env.INTERNAL_ALLOWED_EMAILS = "me@example.com";
    process.env.INTERNAL_ALLOWED_DOMAINS = "internal.test";
    await expect(getUser(mockCtx({ tokenIdentifier: "user|3", email: "outsider@example.com" }))).resolves.toBeNull();
  });
});

describe("requireUser", () => {
  test("returns user when authenticated and allowed", async () => {
    process.env.INTERNAL_ALLOWED_EMAILS = "me@example.com";
    await expect(requireUser(mockCtx({ tokenIdentifier: "user|1", email: "me@example.com", name: "Me" }))).resolves.toEqual({
      id: "user|1",
      email: "me@example.com",
      name: "Me",
    });
  });

  test("throws Not authenticated when not authenticated", async () => {
    process.env.INTERNAL_ALLOWED_EMAILS = "me@example.com";
    await expect(requireUser(mockCtx(null))).rejects.toThrow("Not authenticated");
  });
});
