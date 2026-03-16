// Centralized permission map and helpers

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  MEMBER: "member",
  CLIENT: "client",
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    createProject: true,
    deleteProject: true,
    inviteMembers: true,
    changeRoles: true,
    viewBilling: true,
    manageMembers: true,
    updateOrg: true,
    deleteOrg: true,
    createTask: true,
    updateTask: true,
    uploadFiles: true,
    comment: true,
    viewAllProjects: true,
    viewOwnProjects: true,
    sendMessage: true,
    viewTeamChat: true,
  },
  [ROLES.MANAGER]: {
    createProject: true,
    deleteProject: false,
    inviteMembers: true,
    changeRoles: false,
    viewBilling: false,
    manageMembers: true,
    updateOrg: false,
    deleteOrg: false,
    createTask: true,
    updateTask: true,
    uploadFiles: true,
    comment: true,
    viewAllProjects: true,
    viewOwnProjects: true,
    sendMessage: true,
    viewTeamChat: true,
  },
  [ROLES.MEMBER]: {
    createProject: false,
    deleteProject: false,
    inviteMembers: false,
    changeRoles: false,
    viewBilling: false,
    manageMembers: false,
    updateOrg: false,
    deleteOrg: false,
    createTask: true,
    updateTask: true,
    uploadFiles: true,
    comment: true,
    viewAllProjects: true,
    viewOwnProjects: true,
    sendMessage: true,
    viewTeamChat: true,
  },
  [ROLES.CLIENT]: {
    createProject: false,
    deleteProject: false,
    inviteMembers: false,
    changeRoles: false,
    viewBilling: false,
    manageMembers: false,
    updateOrg: false,
    deleteOrg: false,
    createTask: false,
    updateTask: false,
    uploadFiles: false,
    comment: true,
    viewAllProjects: false,
    viewOwnProjects: true,
    sendMessage: true,
    viewTeamChat: true,
  },
};

/**
 * @param {import("next-auth").Session} session
 * @param {string} permission
 */
export function assertPermission(session, permission) {
  const role = session?.user?.role;
  if (!role) {
    throw new Error("FORBIDDEN");
  }
  if (!PERMISSIONS[role]?.[permission]) {
    throw new Error("FORBIDDEN");
  }
}

export function hasPermission(session, permission) {
  try {
    assertPermission(session, permission);
    return true;
  } catch {
    return false;
  }
}

