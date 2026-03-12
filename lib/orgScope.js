import { prisma } from "./prisma.js";

/**
 * Wraps a Prisma model delegate to automatically scope by orgId.
 * Usage: withOrgScope(session.user.orgId).project.findMany({ where: { status: "active" } })
 *
 * @param {string} orgId
 */
export function withOrgScope(orgId) {
  if (!orgId) {
    throw new Error("Missing orgId for scoped query");
  }

  const handler = {
    get(_target, model) {
      const delegate = prisma[model];
      if (!delegate) return undefined;

      return new Proxy(delegate, {
        get(modelTarget, method) {
          const orig = modelTarget[method];
          if (typeof orig !== "function") return orig;

          return (args = {}) => {
            // Only apply automatic orgId scoping when args.where is an object
            if (args && typeof args.where === "object" && !Array.isArray(args.where)) {
              args = {
                ...args,
                where: {
                  ...args.where,
                  orgId,
                },
              };
            }
            return orig.call(modelTarget, args);
          };
        },
      });
    },
  };

  return new Proxy({}, handler);
}

