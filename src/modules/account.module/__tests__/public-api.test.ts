import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("account.module account switcher ownership", () => {
  it("keeps AccountSwitcher under account.module shell", () => {
    const movedPath = resolve(
      process.cwd(),
      "src/modules/account.module/_components/shell/account-switcher.tsx",
    );
    const oldPath = resolve(
      process.cwd(),
      "src/modules/workspace.module/_components/shell/account-switcher.tsx",
    );

    expect(existsSync(movedPath)).toBe(true);
    expect(existsSync(oldPath)).toBe(false);
  });

  it("exports AccountSwitcher from account.module public API", () => {
    const indexPath = resolve(process.cwd(), "src/modules/account.module/index.ts");
    const source = readFileSync(indexPath, "utf8");

    expect(source).toContain(
      'export { AccountSwitcher } from "./_components/shell/account-switcher";',
    );
  });
});
