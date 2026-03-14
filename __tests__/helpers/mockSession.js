import { vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "next-auth";

/**
 * @param {{ id: string, email?: string, name?: string, role: string, orgId: string }} user
 */
export function mockSession(user) {
  getServerSession.mockResolvedValue({ user });
}
