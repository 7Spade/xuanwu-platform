import { describe, expect, it } from "vitest";

import { getOrganizationsByOwnerId } from "../_use-cases";
import type { AccountEntity } from "../../domain.account/_entity";
import type { IAccountRepository } from "../../domain.account/_ports";

function buildAccountEntity(
  id: string,
  accountType: AccountEntity["accountType"],
  ownerId: string | null,
): AccountEntity {
  const now = "2026-01-01T00:00:00.000Z";

  return {
    id: id as AccountEntity["id"],
    handle: null,
    accountType,
    profile: {
      displayName: id,
      avatarUrl: null,
      bio: null,
      badgeSlugs: [],
    },
    ownerId: ownerId as AccountEntity["ownerId"],
    members: accountType === "organization" ? [] : null,
    teams: accountType === "organization" ? [] : null,
    createdAt: now,
    updatedAt: now,
  };
}

describe("getOrganizationsByOwnerId", () => {
  it("returns only organization accounts even if repository returns mixed data", async () => {
    const repo: IAccountRepository = {
      findById: async () => null,
      findByHandle: async () => null,
      findOrganizationsByOwnerId: async () => [
        buildAccountEntity("org-1", "organization", "owner-1"),
        buildAccountEntity("personal-1", "personal", null),
        buildAccountEntity("org-2", "organization", "owner-1"),
      ],
      save: async () => undefined,
      deleteById: async () => undefined,
    };

    const result = await getOrganizationsByOwnerId(repo, "owner-1");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.map((account) => account.id)).toEqual(["org-1", "org-2"]);
    expect(result.value.every((account) => account.accountType === "organization")).toBe(true);
  });
});
