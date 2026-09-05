import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";
import { db } from "./db";
import * as schema from "./db/schema";

// Two roles. The consultant is "admin" and may manage logins; a customer login is
// "org" and only ever looks at its own organization.
const accessControl = createAccessControl(defaultStatements);
const roles = {
  admin: accessControl.newRole({
    user: ["create", "list", "set-role", "delete", "set-password", "set-email", "get", "update"],
    session: ["list", "revoke", "delete"],
  }),
  org: accessControl.newRole({ user: [], session: [] }),
};

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // The demo has no sign-up page, no reset and no email sending.
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      // Which organization this login belongs to. Null for the admin.
      organizationId: { type: "string", required: false, input: false },
    },
  },
  // The admin plugin gives us the role column and server-side user creation.
  plugins: [
    admin({ ac: accessControl, roles, adminRoles: ["admin"], defaultRole: "org" }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
