import { vi } from "vitest";

vi.mock("../../lib/auth.js", () => ({
  auth: vi.fn(),
}));

import { auth } from "../../lib/auth.js";

/**
 * @param {{ id: string, email?: string, name?: string, role: string, orgId: string }} user
 */
export function mockSession(user) {
  auth.mockResolvedValue({ user });
}
