import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "@/lib/oauth-return-path";
describe("OAuth return path", () => {
  it("preserves consent query and fragment", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#review")).toBe("/.lovable/oauth/consent?authorization_id=abc#review");
  });
  it.each(["//outside.invalid", "/\\outside.invalid", "/a\n", "https://outside.invalid", null])("rejects unsafe redirect %s", (path) => {
    expect(oauthReturnPath(path)).toBe("/");
  });
});