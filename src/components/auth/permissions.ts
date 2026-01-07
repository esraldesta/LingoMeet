import { createAccessControl } from "better-auth/plugins";
import { defaultStatements, userAc, adminAc } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements)

export const user = ac.newRole({
    ...userAc.statements,
    // user: [...userAc.statements.user, "list"]
    user: [...userAc.statements.user]
})

export const pro = ac.newRole({
    ...userAc.statements
    // add pro permission here
})

export const admin = ac.newRole(adminAc.statements)