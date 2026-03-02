import { createAccessControl } from "better-auth/plugins";
import { defaultStatements, userAc, adminAc } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(
    {
  ...defaultStatements,
  room: ["create", "read", "update", "delete"]
}
)

export const user = ac.newRole({
    ...userAc.statements,
    // user: [...userAc.statements.user, "list"]
    user: [...userAc.statements.user],
    room: ["create", "read", "update"]
})

export const pro = ac.newRole({
    ...userAc.statements,
    room: ["read", "update"]
    // add pro permission here
})

export const pro_pending = ac.newRole({
    ...userAc.statements,
	room: ["read"],
});

export const admin = ac.newRole(adminAc.statements)