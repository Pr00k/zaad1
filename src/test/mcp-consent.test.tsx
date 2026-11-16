import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { createElement, type ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  details: vi.fn(), approve: vi.fn(), deny: vi.fn(),
  search: { authorization_id: "authorization-1" },
  auth: { user: { id: "caller-1", email: "test@example.invalid" } as { id: string; email: string } | null, loading: false },
}));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => ({ options, useSearch: () => mocks.search }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { oauth: {
  getAuthorizationDetails: mocks.details, approveAuthorization: mocks.approve, denyAuthorization: mocks.deny,
} } } }));
vi.mock("@/lib/auth", () => ({ useAuth: () => mocks.auth }));
vi.mock("@/lib/i18n", () => ({ useT: () => ({ t: {
  connectAccount: "Connect account", connectionLoading: "Loading", connectionError: "Connection failed",
  approveConnection: "Approve", denyConnection: "Deny", connectionAccess: "Read your financial data",
  connectionBoundary: "Account permissions still apply", shareEmail: "Email", shareProfile: "Profile",
  additionalPermission: "Additional permission",
} }) }));
vi.mock("@/components/zad/AuthScreen", () => ({ AuthScreen: ({ next }: { next: string }) => <a href={next}>Sign in</a> }));
import { Route } from "@/routes/[.]lovable.oauth.consent";

const Consent = Route.options.component as ComponentType;
describe("MCP consent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.search.authorization_id = "authorization-1";
    mocks.auth.user = { id: "caller-1", email: "test@example.invalid" };
    mocks.details.mockResolvedValue({ data: { client: { name: "Test assistant" }, scope: "openid email" }, error: null });
  });
  afterEach(cleanup);
  it("preserves authorization when sign-in is required", () => {
    mocks.auth.user = null;
    render(createElement(Consent));
    expect(screen.getByRole("link").getAttribute("href")).toBe("/.lovable/oauth/consent?authorization_id=authorization-1");
    expect(mocks.details).not.toHaveBeenCalled();
  });
  it("shows an invalid request without contacting the provider", () => {
    mocks.search.authorization_id = "";
    render(createElement(Consent));
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(mocks.details).not.toHaveBeenCalled();
  });
  it.each(["approve", "deny"] as const)("surfaces a failed %s and allows retry", async (action) => {
    mocks[action].mockResolvedValue({ data: null, error: { message: "Provider failure" } });
    render(createElement(Consent));
    const button = await screen.findByRole("button", { name: action === "approve" ? "Approve" : "Deny" });
    fireEvent.click(button);
    await waitFor(() => expect(mocks[action]).toHaveBeenCalledWith("authorization-1"));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(button.hasAttribute("disabled")).toBe(false);
  });
  it("surfaces an expired authorization lookup", async () => {
    mocks.details.mockResolvedValue({ data: null, error: { message: "Expired" } });
    render(createElement(Consent));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
  });
});