import Knex from "knex";

//----------------------------------------------

import AuthConfig from "../../config/auth";

import UserModel from "../../domains/user/UserModel";
import PermissionModel from "../../domains/permission/PermissionModel";
import UserPermissionModel from "../../domains/user/permission/UserPermissionModel";
import AuthUserEntity from "../../domains/user/AuthUserEntity";
import PermissionEntity from "../../domains/permission/PermissionEntity";

//----------------------------------------------

const users: AuthUserEntity[] = AuthConfig.users;

const permissions: PermissionEntity[] = AuthConfig.permissions;

//----------------------------------------------

export async function seed(knex: Knex) : Promise<any> {
    let userModel = UserModel(knex);

    await knex(userModel._getTable()).del();

    await userModel.createUsers(users);

    //-------------------------------------------------

    let permissionModel = PermissionModel(knex);

    await knex(permissionModel._getTable()).del();

    await permissionModel._create(permissions);

    //-------------------------------------------------

    let userPermissionModel = UserPermissionModel(knex);

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
