import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { seedTwoTenants, cleanTenants } from "./helpers/seed.js";
import { mockSession } from "./helpers/mockSession.js";

import * as ProjectsIndexRoute from "../app/api/projects/route.js";
import * as ProjectDetailRoute from "../app/api/projects/[id]/route.js";
import * as ProjectTasksRoute from "../app/api/projects/[id]/tasks/route.js";
import * as ProjectFilesRoute from "../app/api/projects/[id]/files/route.js";
import * as MembersRoute from "../app/api/members/route.js";

/** @type {{ orgA: any, orgB: any, adminA: any, adminB: any, projectA: any, projectB: any } | null} */
let seedData = null;

beforeEach(async () => {
  seedData = await seedTwoTenants();
});

afterEach(async () => {
  await cleanTenants(seedData);
  seedData = null;
});

function orgASession() {
  return {
    id: seedData.adminA.id,
    email: seedData.adminA.email,
    name: seedData.adminA.name,
    role: "admin",
    orgId: seedData.orgA.id,
  };
}

describe("Tenant isolation", () => {
  describe("Projects", () => {
    it("GET /api/projects with org_a session returns only projectA, not projectB", async () => {
      mockSession(orgASession());

      const res = await ProjectsIndexRoute.GET(
        new Request("http://localhost/api/projects")
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe(seedData.projectA.id);
      expect(body[0].orgId).toBe(seedData.orgA.id);
      expect(body.some((p) => p.id === seedData.projectB.id)).toBe(false);
    });

    it("GET /api/projects/[projectB.id] with org_a session returns 403", async () => {
      mockSession(orgASession());

      const res = await ProjectDetailRoute.GET(
        new Request(`http://localhost/api/projects/${seedData.projectB.id}`),
        { params: { id: seedData.projectB.id } }
      );

      expect([403, 404]).toContain(res.status);
    });

    it("PATCH /api/projects/[projectB.id] with org_a session returns 403", async () => {
      mockSession(orgASession());

      const res = await ProjectDetailRoute.PATCH(
        new Request(`http://localhost/api/projects/${seedData.projectB.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Hacked" }),
        }),
        { params: { id: seedData.projectB.id } }
      );

      expect([403, 404]).toContain(res.status);
    });

    it("DELETE /api/projects/[projectB.id] with org_a session returns 403", async () => {
      mockSession(orgASession());

      const res = await ProjectDetailRoute.DELETE(
        new Request(`http://localhost/api/projects/${seedData.projectB.id}`, {
          method: "DELETE",
        }),
        { params: { id: seedData.projectB.id } }
      );

      expect([403, 404]).toContain(res.status);
    });
  });

  describe("Tasks", () => {
    it("POST /api/projects/[projectB.id]/tasks with org_a session returns 403", async () => {
      mockSession(orgASession());

      const res = await ProjectTasksRoute.POST(
        new Request(
          `http://localhost/api/projects/${seedData.projectB.id}/tasks`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Task" }),
          }
        ),
        { params: { id: seedData.projectB.id } }
      );

      expect([403, 404]).toContain(res.status);
    });

    it("GET /api/projects/[projectB.id]/tasks with org_a session returns 403", async () => {
      mockSession(orgASession());

      const res = await ProjectTasksRoute.GET(
        new Request(
          `http://localhost/api/projects/${seedData.projectB.id}/tasks`
        ),
        { params: { id: seedData.projectB.id } }
      );

      expect([403, 404]).toContain(res.status);
    });
  });

  describe("Files", () => {
    it("GET /api/projects/[projectB.id]/files with org_a session returns 403", async () => {
      mockSession(orgASession());

      const res = await ProjectFilesRoute.GET(
        new Request(
          `http://localhost/api/projects/${seedData.projectB.id}/files`
        ),
        { params: { id: seedData.projectB.id } }
      );

      expect([403, 404]).toContain(res.status);
    });
  });

  describe("Members", () => {
    it("GET /api/members with org_a session returns only org_a members, not org_b members", async () => {
      mockSession(orgASession());

      const res = await MembersRoute.GET(
        new Request("http://localhost/api/members")
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe(seedData.adminA.id);
      expect(body[0].email).toBe(seedData.adminA.email);
      expect(body.some((m) => m.id === seedData.adminB.id)).toBe(false);
    });
  });
});
