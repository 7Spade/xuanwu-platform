import { describe, expect, it } from "vitest";

import { resolveActiveAccount } from "../_active-account";
import type { AccountDTO } from "../_use-cases";

function makeAccount(overrides: Partial<AccountDTO>): AccountDTO {
  return {
    id: "account-personal",
    handle: "personal",
    accountType: "personal",
    displayName: "Personal",
    avatarUrl: null,
    bio: null,
    badgeSlugs: [],
    ownerId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("resolveActiveAccount", () => {
  it("returns null when personal account is unavailable", () => {
    const organization = makeAccount({
      id: "org-1",
      accountType: "organization",
      displayName: "Org 1",
      ownerId: "account-personal",
    });

    expect(resolveActiveAccount(null, [organization], "org-1")).toBeNull();
  });

  it("returns personal account when no preference exists", () => {
    const personal = makeAccount({});
    const organization = makeAccount({
      id: "org-1",
      accountType: "organization",
      displayName: "Org 1",
      ownerId: personal.id,
    });

    expect(resolveActiveAccount(personal, [organization], null)).toEqual(personal);
  });

  it("returns personal account when preference is personal account id", () => {
    const personal = makeAccount({});
    const organization = makeAccount({
      id: "org-1",
      accountType: "organization",
      displayName: "Org 1",
      ownerId: personal.id,
    });

    expect(resolveActiveAccount(personal, [organization], personal.id)).toEqual(personal);
  });

  it("returns matching organization when preference is organization id", () => {
    const personal = makeAccount({});
    const organization = makeAccount({
      id: "org-1",
      accountType: "organization",
      displayName: "Org 1",
      ownerId: personal.id,
    });

    expect(resolveActiveAccount(personal, [organization], "org-1")).toEqual(organization);
  });

  it("falls back to personal account when preferred organization does not exist", () => {
    const personal = makeAccount({});
    const organization = makeAccount({
      id: "org-1",
      accountType: "organization",
      displayName: "Org 1",
      ownerId: personal.id,
    });

    expect(resolveActiveAccount(personal, [organization], "org-2")).toEqual(personal);
  });
});
