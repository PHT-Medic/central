import Knex from "knex";

//----------------------------------------------

import AuthConfig from "../../config/auth";

import AuthUserModel from "../../domains/auth/user/AuthUserModel";
import AuthPermissionModel from "../../domains/auth/permission/AuthPermissionModel";
import AuthUserPermissionModel from "../../domains/auth/user/permission/AuthUserPermissionModel";
import AuthUserEntity from "../../domains/auth/user/AuthUserEntity";
import AuthPermissionEntity from "../../domains/auth/permission/AuthPermissionEntity";

//----------------------------------------------

const users: AuthUserEntity[] = AuthConfig.users;

const permissions: AuthPermissionEntity[] = AuthConfig.permissions;

//----------------------------------------------

export async function seed(knex: Knex) : Promise<any> {
    let userModel = AuthUserModel(knex);

    await knex(userModel._getTable()).del();

    await userModel.createUsers(users);

    //-------------------------------------------------

    let permissionModel = AuthPermissionModel(knex);

    await knex(permissionModel._getTable()).del();

    await permissionModel._create(permissions);

    //-------------------------------------------------

    let userPermissionModel = AuthUserPermissionModel(knex);

    await knex(userPermissionModel._getTable()).del();

    let userPermissions = [];

    for(let i=0; i<users.length; i++) {
        for(let j=0; j<permissions.length; j++) {
            let userPermission = {
                user_id: i+1,
                permission_id: j+1
            };

            userPermissions.push(userPermission);
        }
    }

    await userPermissionModel._create(userPermissions);

    return;
}

export {
    users,
    permissions
}
